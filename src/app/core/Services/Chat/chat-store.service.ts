import { computed, DestroyRef, effect, inject, Service, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { toast } from 'ngx-sonner';
import { firstValueFrom } from 'rxjs';
import {
  ChatMessage,
  ConversationSummary,
  ConversationType,
  ConversationView,
  MessageReadReceipt,
  PendingMessage,
  TypingIndicator,
} from '../../models/chat/chat.models';
import { AuthStoreService } from '../auth-store.service';
import { LanguageService } from '../language';
import { ChatApiService } from './chat-api.service';
import { ChatDirectoryService } from './chat-directory.service';
import { ChatHubService } from './chat-hub.service';

const PAGE_SIZE = 40;
/**
 * Rows are real DOM now, so the loaded window is capped: an endless "scroll up"
 * must not keep growing the node tree. 500 rows ≈ 7k nodes, which stays smooth
 * on mid-range mobile.
 */
const MAX_LOADED_MESSAGES = 500;
/** How long a hub-sent message may stay unacknowledged before it is marked failed. */
const ECHO_TIMEOUT_MS = 12_000;
/** How long a typing indicator survives without a follow-up event. */
const TYPING_TTL_MS = 5_000;
/** Minimum gap between two `SendTypingIndicator(true)` calls for one conversation. */
const TYPING_THROTTLE_MS = 2_000;

interface PageState {
  hasMore: boolean;
  nextCursor: string | null;
}

/**
 * Root store for the chat feature.
 *
 * Owns the conversation list, the per-conversation message windows and the
 * realtime side-effects (presence, typing, unread badges, read receipts). The
 * SignalR connection follows the session: it opens once the user is
 * authenticated and closes on logout.
 */
@Service()
export class ChatStoreService {
  private readonly api = inject(ChatApiService);
  private readonly hub = inject(ChatHubService);
  private readonly directory = inject(ChatDirectoryService);
  private readonly auth = inject(AuthStoreService);
  private readonly language = inject(LanguageService);
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  // State
  private readonly conversationState = signal<ConversationSummary[]>([]);
  private readonly messagesState = signal<ReadonlyMap<string, ChatMessage[]>>(new Map());
  private readonly pageState = signal<ReadonlyMap<string, PageState>>(new Map());
  private readonly receiptsState = signal<
    ReadonlyMap<string, ReadonlyMap<string, MessageReadReceipt>>
  >(new Map());
  private readonly typingState = signal<ReadonlyMap<string, TypingIndicator[]>>(new Map());
  private readonly onlineState = signal<ReadonlyMap<string, boolean>>(new Map());
  /** Messages written locally and not acknowledged by the server yet. */
  private readonly pendingState = signal<ReadonlyMap<string, PendingMessage[]>>(new Map());
  private readonly activeIdState = signal<string | null>(null);

  public readonly connectionState = this.hub.state;
  public readonly isLoadingConversations = signal(false);
  public readonly isLoadingMessages = signal(false);
  public readonly isLoadingOlder = signal(false);
  public readonly hasLoadedConversations = signal(false);

  public readonly currentUserId = computed(() => this.auth.user()?.id ?? null);
  public readonly activeConversationId = this.activeIdState.asReadonly();

  /** Outbox for the open thread: rows awaiting an ack, or failed to send. */
  public readonly pending = this.pendingState.asReadonly();

  // Derived state
  public readonly conversations = computed<ConversationView[]>(() => {
    const me = this.currentUserId();
    const contacts = this.directory.contacts();
    // Language is read so the computed re-runs when the locale changes.
    this.language.lang();

    const unknownContact = this.translate.instant('CHAT.UNKNOWN_CONTACT');
    const youPrefix = this.translate.instant('CHAT.YOU_PREFIX');
    const onlineLabel = this.translate.instant('CHAT.PRESENCE.ONLINE');

    return [...this.conversationState()]
      .sort((a, b) => this.sortKey(b).localeCompare(this.sortKey(a)))
      .map((summary) => {
        const others = summary.memberUserIds.filter((id) => id !== me);
        const otherContacts = others.map((id) => contacts.get(id));
        const isGroup = summary.type === ConversationType.Group;

        const title = isGroup
          ? summary.title?.trim() ||
            otherContacts
              .map((contact) => contact?.name)
              .filter((name): name is string => !!name)
              .join('، ') ||
            unknownContact
          : otherContacts[0]?.name || unknownContact;

        const hasPreview = !!summary.lastMessageContent;
        const preview = hasPreview
          ? `${summary.lastMessageSenderId === me ? youPrefix : ''}${summary.lastMessageContent}`
          : this.translate.instant('CHAT.NO_MESSAGES');

        const subtitle = isGroup
          ? `${others.length + 1} ${this.translate.instant('CHAT.MEMBERS')}`
          : otherContacts[0]?.subtitle || null;

        return {
          id: summary.id,
          type: summary.type,
          title,
          subtitle:
            !isGroup && otherContacts[0] && this.onlineState().get(otherContacts[0].userId)
              ? onlineLabel
              : subtitle,
          preview,
          lastMessageAt: summary.lastMessageAt ?? summary.createdAt,
          unreadCount: summary.unreadCount,
          isOnline:
            !isGroup && !!otherContacts[0] && !!this.onlineState().get(otherContacts[0].userId),
          avatarUrl: otherContacts[0]?.avatarUrl ?? null,
          isGroup,
          participantIds: others,
        };
      });
  });

  public readonly activeConversation = computed<ConversationView | null>(() => {
    const id = this.activeIdState();
    return id
      ? (this.conversations().find((conversation) => conversation.id === id) ?? null)
      : null;
  });

  public readonly activeMessages = computed<ChatMessage[]>(() => {
    const id = this.activeIdState();
    return id ? (this.messagesState().get(id) ?? []) : [];
  });

  /** People currently typing in the open thread, excluding the viewer. */
  public readonly activeTyping = computed<TypingIndicator[]>(() => {
    const id = this.activeIdState();
    const me = this.currentUserId();
    if (!id) return [];

    return (this.typingState().get(id) ?? []).filter((indicator) => indicator.userId !== me);
  });

  /** Read receipts of the open thread, keyed by reader id. */
  public readonly activeReceipts = computed<ReadonlyMap<string, MessageReadReceipt>>(() => {
    const id = this.activeIdState();
    return id ? (this.receiptsState().get(id) ?? new Map()) : new Map();
  });

  public readonly hasOlderMessages = computed<boolean>(() => {
    const id = this.activeIdState();
    return id ? !!this.pageState().get(id)?.hasMore : false;
  });

  public readonly totalUnread = computed(() =>
    this.conversations().reduce((total, conversation) => total + conversation.unreadCount, 0),
  );

  // ── Internal bookkeeping ───────────────────────────────────────────────
  private connectedForUser: string | null = null;
  private connectionAttempt: Promise<void> | null = null;
  private readonly markReadInFlight = new Set<string>();
  private readonly typingSentAt = new Map<string, number>();
  private readonly typingTimers = new Map<string, ReturnType<typeof setTimeout>>();
  /** Watchdogs for hub-sent messages that have not been echoed back yet. */
  private readonly echoTimers = new Map<string, ReturnType<typeof setTimeout>>();

  constructor() {
    // Follow the session: connect after login/refresh, tear down on logout.
    effect(() => {
      const ready = this.auth.isAuthChecked() && this.auth.isLoggedIn();
      const userId = this.currentUserId();

      if (ready && userId) {
        void this.ensureConnected();
      } else if (!ready && this.connectedForUser) {
        void this.disconnect();
      }
    });

    this.hub.messages$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((message) => this.handleIncomingMessage(message));

    this.hub.readReceipts$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((receipt) => this.storeReceipt(receipt));

    this.hub.typing$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((indicator) => this.handleTyping(indicator));

    this.hub.unreadCounts$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((update) =>
      this.patchConversation(update.conversationId, () => ({
        unreadCount: update.unreadCount,
      })),
    );

    this.hub.presence$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((presence) =>
      this.onlineState.update((current) => {
        const next = new Map(current);
        next.set(presence.userId, presence.isOnline);
        return next;
      }),
    );

    this.hub.reconnected$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => void this.resyncAfterReconnect());

    this.destroyRef.onDestroy(() => {
      this.typingTimers.forEach((timer) => clearTimeout(timer));
      this.typingTimers.clear();
    });
  }

  // ── Connection lifecycle ───────────────────────────────────────────────

  /** Opens the hub (idempotent) and hydrates the conversation list. */
  public async ensureConnected(): Promise<void> {
    const userId = this.currentUserId();
    if (!userId || this.connectedForUser === userId) return;
    if (this.connectionAttempt) return this.connectionAttempt;

    this.connectionAttempt = (async () => {
      try {
        await this.hub.connect();
        this.connectedForUser = userId;
      } catch {
        // Realtime is optional: the REST endpoints still fill the screens, and
        // the page retries the socket whenever it is opened again.
        this.connectedForUser = null;
      }

      try {
        await this.directory.ensureLoaded();
        await this.refreshConversations();
      } finally {
        this.connectionAttempt = null;
      }
    })();

    return this.connectionAttempt;
  }

  /** Manual retry used by the messages page when the socket is down. */
  public async retryConnection(): Promise<void> {
    this.connectedForUser = null;
    await this.ensureConnected();
  }

  /** Closes the socket and forgets everything tied to the previous session. */
  public async disconnect(): Promise<void> {
    this.connectedForUser = null;
    await this.hub.disconnect();

    this.conversationState.set([]);
    this.messagesState.set(new Map());
    this.pageState.set(new Map());
    this.receiptsState.set(new Map());
    this.typingState.set(new Map());
    this.onlineState.set(new Map());
    this.pendingState.set(new Map());
    this.activeIdState.set(null);
    this.hasLoadedConversations.set(false);

    this.echoTimers.forEach((timer) => clearTimeout(timer));
    this.echoTimers.clear();
  }

  // ── Conversation loading ───────────────────────────────────────────────

  public async refreshConversations(): Promise<void> {
    this.isLoadingConversations.set(true);

    try {
      const conversations = await firstValueFrom(this.api.getConversations());
      this.conversationState.set(conversations ?? []);
      this.hasLoadedConversations.set(true);

      if (this.hub.isConnected) {
        await Promise.all(
          (conversations ?? []).map((conversation) =>
            this.hub.joinConversation(conversation.id).catch(() => undefined),
          ),
        );
      }

      await this.directory.ensureLoaded();
      const me = this.currentUserId();
      const memberIds = (conversations ?? [])
        .flatMap((conversation) => conversation.memberUserIds)
        .filter((id) => id !== me);
      void this.directory.resolve(memberIds);
    } catch (error) {
      this.reportError(error, 'CHAT.ERRORS.LOAD_CONVERSATIONS');
    } finally {
      this.isLoadingConversations.set(false);
    }
  }

  /** Opens a thread: joins its group, loads the newest page and clears the badge. */
  public async openConversation(conversationId: string): Promise<void> {
    this.activeIdState.set(conversationId);

    // SignalR drops group membership on reconnect, and a conversation created
    // while the socket was down was never joined — without this the server has
    // nowhere to echo the sender's own messages.
    if (this.hub.isConnected) {
      void this.hub.joinConversation(conversationId).catch(() => undefined);
    }

    if (!this.messagesState().has(conversationId)) {
      await this.loadNewestMessages(conversationId);
    }

    this.markConversationRead(conversationId);
  }

  /** Leaves the thread view (keeps the group subscription for live list updates). */
  public closeConversation(): void {
    this.activeIdState.set(null);
  }

  /** Loads the next (older) page. Returns how many messages were prepended. */
  public async loadOlderMessages(): Promise<number> {
    const conversationId = this.activeIdState();
    if (!conversationId || this.isLoadingOlder()) return 0;

    const page = this.pageState().get(conversationId);
    if (!page?.hasMore || !page.nextCursor) return 0;

    const before = this.messagesState().get(conversationId)?.length ?? 0;

    // Stop pulling history once the window is full; the API has more, but the
    // DOM should not. The thread then reports "beginning of conversation".
    if (before >= MAX_LOADED_MESSAGES) {
      this.setPageState(conversationId, false, null);
      return 0;
    }

    this.isLoadingOlder.set(true);

    try {
      const result = await firstValueFrom(
        this.api.getMessages(conversationId, page.nextCursor, PAGE_SIZE),
      );

      this.mergeMessages(conversationId, result.items ?? []);
      this.setPageState(conversationId, !!result.hasMore, result.nextCursor ?? null);

      return (this.messagesState().get(conversationId)?.length ?? 0) - before;
    } catch (error) {
      this.reportError(error, 'CHAT.ERRORS.LOAD_MESSAGES');
      return 0;
    } finally {
      this.isLoadingOlder.set(false);
    }
  }

  // ── Writing ────────────────────────────────────────────────────────────

  /**
   * Sends a message. The row is inserted locally first ("optimistic"), so the
   * conversation always shows it — a hub echo, a REST response or a failure all
   * reconcile against that same row.
   */
  public async sendMessage(content: string): Promise<void> {
    const conversationId = this.activeIdState();
    const body = content.trim();
    const me = this.currentUserId();

    if (!conversationId || !body || !me) return;

    this.sendTyping(false);
    await this.deliver(this.addPending(conversationId, me, body));
  }

  /** Re-sends a message that previously failed. */
  public async retryMessage(localId: string): Promise<void> {
    const pending = this.findPending(localId);
    if (!pending) return;

    this.patchPending(localId, { delivery: 'sending' });
    await this.deliver({ ...pending, delivery: 'sending' });
  }

  private async deliver(pending: PendingMessage): Promise<void> {
    const { conversationId, content, id, senderId, sentAt } = pending;

    if (this.hub.isConnected) {
      try {
        await this.hub.sendMessage(conversationId, content);
        // The server broadcasts the stored message back to the group. If that
        // echo never lands (connection not in the group yet, outbox delay), we
        // ask the API whether the message was actually stored rather than
        // assuming the send failed.
        this.armEchoWatchdog(pending);
        return;
      } catch (error) {
        console.warn('[Chat] hub send failed, falling back to REST', error);
      }
    }

    try {
      const messageId = await firstValueFrom(this.api.sendMessage(conversationId, content));
      this.removePending(id);
      this.handleIncomingMessage(
        { id: messageId, conversationId, senderId, content, sentAt },
        false,
      );
    } catch (error) {
      console.warn('[Chat] REST send failed, verifying delivery', error);
      await this.verifyDelivery(pending, error);
    }
  }

  private addPending(conversationId: string, senderId: string, content: string): PendingMessage {
    const pending: PendingMessage = {
      id: `local-${crypto.randomUUID()}`,
      conversationId,
      senderId,
      content,
      sentAt: new Date().toISOString(),
      delivery: 'sending',
    };

    this.pendingState.update((current) => {
      const next = new Map(current);
      next.set(conversationId, [...(next.get(conversationId) ?? []), pending]);
      return next;
    });

    return pending;
  }

  private patchPending(localId: string, patch: Partial<PendingMessage>): void {
    this.pendingState.update((current) => {
      let changed = false;

      const next = new Map(current);
      for (const [conversationId, list] of next) {
        if (!list.some((entry) => entry.id === localId)) continue;

        next.set(
          conversationId,
          list.map((entry) => (entry.id === localId ? { ...entry, ...patch } : entry)),
        );
        changed = true;
      }

      return changed ? next : current;
    });
  }

  private removePending(localId: string): void {
    this.clearEchoTimer(localId);

    this.pendingState.update((current) => {
      let changed = false;
      const next = new Map(current);

      for (const [conversationId, list] of next) {
        const filtered = list.filter((entry) => entry.id !== localId);
        if (filtered.length === list.length) continue;

        next.set(conversationId, filtered);
        changed = true;
      }

      return changed ? next : current;
    });
  }

  private findPending(localId: string): PendingMessage | undefined {
    for (const list of this.pendingState().values()) {
      const match = list.find((entry) => entry.id === localId);
      if (match) return match;
    }

    return undefined;
  }

  /** Drops the optimistic row that a server message supersedes. */
  private resolveEcho(conversationId: string, message: ChatMessage): void {
    if (message.senderId !== this.currentUserId()) return;

    const pending = this.pendingState().get(conversationId) ?? [];
    if (pending.length === 0) return;

    const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

    // The server may trim/collapse the text it stores, so fall back to the oldest
    // unanswered row — echoes come back in send order.
    const match =
      pending.find((entry) => normalize(entry.content) === normalize(message.content)) ??
      pending[0];

    this.removePending(match.id);
  }

  /**
   * The echo is not guaranteed — the connection may not have joined the group
   * yet, the outbox may be slow, or the server may normalise the text. Ask the
   * API before declaring the send failed, so a stored message never shows a
   * retry button.
   */
  private async verifyDelivery(pending: PendingMessage, cause?: unknown): Promise<void> {
    if (!this.findPending(pending.id)) return; // the echo already resolved it

    const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

    try {
      const page = await firstValueFrom(
        this.api.getMessages(pending.conversationId, null, PAGE_SIZE),
      );

      const stored = (page.items ?? []).find(
        (message) =>
          message.senderId === pending.senderId &&
          normalize(message.content) === normalize(pending.content),
      );

      if (stored) {
        this.removePending(pending.id);
        this.handleIncomingMessage(stored, false);
        return;
      }
    } catch (error) {
      console.warn('[Chat] delivery verification failed', error);
    }

    this.patchPending(pending.id, { delivery: 'failed' });

    if (cause) this.reportError(cause, 'CHAT.ERRORS.SEND');
  }

  private armEchoWatchdog(pending: PendingMessage): void {
    this.clearEchoTimer(pending.id);

    this.echoTimers.set(
      pending.id,
      setTimeout(() => {
        this.echoTimers.delete(pending.id);
        void this.verifyDelivery(pending);
      }, ECHO_TIMEOUT_MS),
    );
  }

  private clearEchoTimer(localId: string): void {
    const timer = this.echoTimers.get(localId);
    if (!timer) return;

    clearTimeout(timer);
    this.echoTimers.delete(localId);
  }

  /** Throttled typing heartbeat for the open conversation. */
  public sendTyping(isTyping: boolean): void {
    const conversationId = this.activeIdState();
    if (!conversationId || !this.hub.isConnected) return;

    if (!isTyping) {
      if (!this.typingSentAt.has(conversationId)) return;
      this.typingSentAt.delete(conversationId);
      void this.hub.sendTyping(conversationId, false).catch(() => undefined);
      return;
    }

    const lastSentAt = this.typingSentAt.get(conversationId) ?? 0;
    const now = Date.now();

    if (now - lastSentAt < TYPING_THROTTLE_MS) return;

    this.typingSentAt.set(conversationId, now);
    void this.hub.sendTyping(conversationId, true).catch(() => undefined);
  }

  /** Creates (or reuses) a direct conversation and opens it. */
  public async startDirectConversation(otherUserId: string): Promise<string | null> {
    try {
      const conversationId = await firstValueFrom(this.api.createDirectConversation(otherUserId));
      await this.refreshConversations();
      await this.openConversation(conversationId);
      return conversationId;
    } catch (error) {
      this.reportError(error, 'CHAT.ERRORS.CREATE');
      return null;
    }
  }

  // ── Realtime handlers ──────────────────────────────────────────────────

  private handleIncomingMessage(message: ChatMessage, resolvePendingEcho = true): void {
    const me = this.currentUserId();

    if (resolvePendingEcho) this.resolveEcho(message.conversationId, message);

    this.mergeMessages(message.conversationId, [message]);
    this.clearTyping(message.conversationId, message.senderId);

    const known = this.conversationState().some(
      (conversation) => conversation.id === message.conversationId,
    );

    if (!known) {
      // Someone opened a new conversation with us — pull it into the list.
      void this.refreshConversations();
      return;
    }

    const isActive = this.activeIdState() === message.conversationId;

    this.patchConversation(message.conversationId, (conversation) => ({
      ...conversation,
      lastMessageAt: message.sentAt,
      lastMessageContent: message.content,
      lastMessageSenderId: message.senderId,
      unreadCount: message.senderId === me || isActive ? 0 : conversation.unreadCount + 1,
    }));

    if (isActive && message.senderId !== me) {
      this.markConversationRead(message.conversationId);
    }
  }

  private handleTyping(indicator: TypingIndicator): void {
    this.typingState.update((current) => {
      const next = new Map(current);
      const existing = (next.get(indicator.conversationId) ?? []).filter(
        (entry) => entry.userId !== indicator.userId,
      );

      next.set(indicator.conversationId, indicator.isTyping ? [...existing, indicator] : existing);
      return next;
    });

    const timerKey = `${indicator.conversationId}:${indicator.userId}`;
    const timer = this.typingTimers.get(timerKey);
    if (timer) {
      clearTimeout(timer);
      this.typingTimers.delete(timerKey);
    }

    if (!indicator.isTyping) return;

    this.typingTimers.set(
      timerKey,
      setTimeout(() => {
        this.clearTyping(indicator.conversationId, indicator.userId);
        this.typingTimers.delete(timerKey);
      }, TYPING_TTL_MS),
    );
  }

  private clearTyping(conversationId: string, userId: string): void {
    this.typingState.update((current) => {
      const existing = current.get(conversationId);
      if (!existing?.some((entry) => entry.userId === userId)) return current;

      const next = new Map(current);
      next.set(
        conversationId,
        existing.filter((entry) => entry.userId !== userId),
      );
      return next;
    });
  }

  private storeReceipt(receipt: MessageReadReceipt): void {
    this.receiptsState.update((current) => {
      const next = new Map(current);
      const conversationReceipts = new Map(next.get(receipt.conversationId) ?? []);
      conversationReceipts.set(receipt.userId, receipt);
      next.set(receipt.conversationId, conversationReceipts);
      return next;
    });

    if (receipt.userId === this.currentUserId()) {
      this.patchConversation(receipt.conversationId, () => ({ unreadCount: 0 }));
    }
  }

  private async resyncAfterReconnect(): Promise<void> {
    this.connectedForUser = this.currentUserId();
    await this.refreshConversations();

    const activeId = this.activeIdState();
    if (activeId) {
      await this.loadNewestMessages(activeId, true);
      this.markConversationRead(activeId);
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────

  private async loadNewestMessages(conversationId: string, force = false): Promise<void> {
    if (!force && this.messagesState().has(conversationId)) return;

    this.isLoadingMessages.set(true);

    try {
      const page = await firstValueFrom(this.api.getMessages(conversationId, null, PAGE_SIZE));
      this.mergeMessages(conversationId, page.items ?? []);
      this.setPageState(conversationId, !!page.hasMore, page.nextCursor ?? null);
    } catch (error) {
      this.reportError(error, 'CHAT.ERRORS.LOAD_MESSAGES');
    } finally {
      this.isLoadingMessages.set(false);
    }
  }

  private markConversationRead(conversationId: string): void {
    const me = this.currentUserId();
    const messages = this.messagesState().get(conversationId);
    const lastMessage = messages?.[messages.length - 1];

    if (!me || !lastMessage || this.markReadInFlight.has(conversationId)) return;
    if (this.receiptsState().get(conversationId)?.get(me)?.lastReadMessageId === lastMessage.id) {
      return;
    }

    this.markReadInFlight.add(conversationId);

    const applyLocally = () => {
      this.storeReceipt({
        conversationId,
        userId: me,
        lastReadMessageId: lastMessage.id,
        readAt: new Date().toISOString(),
      });
      this.patchConversation(conversationId, () => ({ unreadCount: 0 }));
    };

    const request = this.hub.isConnected
      ? this.hub.markAsRead(conversationId, lastMessage.id)
      : firstValueFrom(this.api.markAsRead(conversationId, lastMessage.id)).then(() => undefined);

    request
      .then(applyLocally)
      .catch(() => undefined)
      .finally(() => this.markReadInFlight.delete(conversationId));
  }

  private mergeMessages(conversationId: string, incoming: ChatMessage[]): void {
    if (incoming.length === 0) return;

    this.messagesState.update((current) => {
      const next = new Map(current);
      const byId = new Map<string, ChatMessage>();

      (next.get(conversationId) ?? []).forEach((message) => byId.set(message.id, message));
      incoming.forEach((message) => byId.set(message.id, message));

      next.set(
        conversationId,
        [...byId.values()].sort((a, b) => this.timeOf(a.sentAt) - this.timeOf(b.sentAt)),
      );
      return next;
    });
  }

  private patchConversation(
    conversationId: string,
    patch: (conversation: ConversationSummary) => Partial<ConversationSummary>,
  ): void {
    this.conversationState.update((current) => {
      let changed = false;

      const next = current.map((conversation) => {
        if (conversation.id !== conversationId) return conversation;
        changed = true;
        return { ...conversation, ...patch(conversation) };
      });

      return changed ? next : current;
    });
  }

  private setPageState(conversationId: string, hasMore: boolean, nextCursor: string | null): void {
    this.pageState.update((current) => {
      const next = new Map(current);
      next.set(conversationId, { hasMore, nextCursor });
      return next;
    });
  }

  private sortKey(conversation: ConversationSummary): string {
    return conversation.lastMessageAt ?? conversation.createdAt ?? '';
  }

  private timeOf(value: string): number {
    return new Date(value).getTime();
  }

  private reportError(error: unknown, fallbackKey: string): void {
    const message =
      error instanceof Error && error.message ? error.message : this.translate.instant(fallbackKey);

    toast.error(message);
  }
}
