import { Component, computed, inject, OnInit, signal, viewChild } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  ChatContact,
  ChatMessage,
  MessageDelivery,
  MessageReadReceipt,
  ThreadItem,
} from '../../../../../../core/models/chat/chat.models';
import { dayKey, isToday, isYesterday } from '../../../../../../core/services/chat/chat-day';
import { ChatDirectoryService } from '../../../../../../core/services/chat/chat-directory.service';
import { ChatStoreService } from '../../../../../../core/services/chat/chat-store.service';
import { LanguageService } from '../../../../../../core/services/language';
import { ChatThreadComponent } from '../../components/chat-thread/chat-thread';
import { ConversationListComponent } from '../../components/conversation-list/conversation-list';
import { NewChatDialogComponent } from '../../components/new-chat-dialog/new-chat-dialog';

@Component({
  selector: 'app-messages-page',
  imports: [ConversationListComponent, ChatThreadComponent, NewChatDialogComponent, TranslatePipe],
  templateUrl: './messages-page.html',
  styleUrl: './messages-page.css',
})
export class MessagesPageComponent implements OnInit {
  private readonly store = inject(ChatStoreService);
  private readonly directory = inject(ChatDirectoryService);
  private readonly language = inject(LanguageService);
  private readonly translate = inject(TranslateService);
  private readonly thread = viewChild(ChatThreadComponent);

  protected readonly conversations = this.store.conversations;
  protected readonly activeConversation = this.store.activeConversation;
  protected readonly activeConversationId = this.store.activeConversationId;
  protected readonly isLoadingConversations = this.store.isLoadingConversations;
  protected readonly hasLoadedConversations = this.store.hasLoadedConversations;
  protected readonly totalUnread = this.store.totalUnread;
  protected readonly isLoadingMessages = this.store.isLoadingMessages;
  protected readonly isLoadingOlder = this.store.isLoadingOlder;
  protected readonly hasOlderMessages = this.store.hasOlderMessages;
  protected readonly connectionState = this.store.connectionState;

  protected readonly isNewChatOpen = signal(false);
  protected readonly isThreadOpen = computed(() => !!this.activeConversation());

  /** Messages flattened into virtual-scroll rows (day dividers + bubbles). */
  protected readonly threadItems = computed<ThreadItem[]>(() => this.buildThreadItems());

  /** Display names of the people typing in the open thread. */
  protected readonly typingNames = computed(() =>
    this.store
      .activeTyping()
      .map((indicator) => this.directory.find(indicator.userId)?.name ?? '')
      .filter((name): name is string => name.length > 0),
  );

  public ngOnInit(): void {
    void this.directory.ensureLoaded();

    if (this.store.connectionState() !== 'connected') {
      void this.store.retryConnection();
    }
  }

  protected async selectConversation(conversationId: string): Promise<void> {
    if (this.store.activeConversationId() === conversationId) return;

    await this.store.openConversation(conversationId);
  }

  protected closeThread(): void {
    this.store.closeConversation();
  }

  protected async loadOlderMessages(): Promise<void> {
    const thread = this.thread();
    const anchor = thread?.beginHistoryLoad() ?? null;
    const added = await this.store.loadOlderMessages();

    // Restore even when nothing was added, so the measuring window always closes.
    if (anchor) {
      thread?.restoreScrollAnchor(anchor);
    } else if (added > 0) {
      thread?.scrollToEnd();
    }
  }

  protected async sendMessage(content: string): Promise<void> {
    await this.store.sendMessage(content);
    this.thread()?.scrollToEnd();
  }

  protected retryMessage(localId: string): void {
    void this.store.retryMessage(localId);
  }

  protected onTyping(isTyping: boolean): void {
    this.store.sendTyping(isTyping);
  }

  protected reconnect(): void {
    void this.store.retryConnection();
  }

  protected openNewChat(): void {
    this.isNewChatOpen.set(true);
  }

  protected closeNewChat(): void {
    this.isNewChatOpen.set(false);
  }

  protected async startConversation(userId: string): Promise<void> {
    this.isNewChatOpen.set(false);
    await this.store.startDirectConversation(userId);
  }

  private buildThreadItems(): ThreadItem[] {
    const me = this.store.currentUserId();
    const conversation = this.activeConversation();
    const pending = conversation ? (this.store.pending().get(conversation.id) ?? []) : [];
    const receipts = this.store.activeReceipts();
    const contacts = this.directory.contacts();

    // Delivered messages first, then the outbox — pending rows are always the
    // newest thing the viewer wrote.
    const outgoing: { message: ChatMessage; delivery: MessageDelivery }[] = [
      ...this.store.activeMessages().map((message) => ({
        message,
        delivery: 'sent' as const,
      })),
      ...pending.map((entry) => ({
        message: {
          id: entry.id,
          conversationId: entry.conversationId,
          senderId: entry.senderId,
          content: entry.content,
          sentAt: entry.sentAt,
        },
        delivery: entry.delivery,
      })),
    ];

    // Translation lookup is not reactive: reading the language signal makes the
    // computed re-run after a locale switch.
    this.language.lang();

    const unknownContact = this.translate.instant('CHAT.UNKNOWN_CONTACT');
    const items: ThreadItem[] = [];
    let currentDay = '';
    let previousSender = '';

    outgoing.forEach(({ message, delivery }) => {
      const day = dayKey(message.sentAt);

      if (day !== currentDay) {
        items.push({
          kind: 'date',
          id: `day-${day}`,
          at: message.sentAt,
          labelKey: isToday(message.sentAt)
            ? 'CHAT.TODAY'
            : isYesterday(message.sentAt)
              ? 'CHAT.YESTERDAY'
              : null,
        });
        currentDay = day;
        previousSender = '';
      }

      items.push(
        this.toMessageItem(message, {
          me,
          contacts,
          receipts,
          unknownContact,
          isGroup: !!conversation?.isGroup,
          previousSender,
          delivery,
        }),
      );

      previousSender = message.senderId;
    });

    return items;
  }

  private toMessageItem(
    message: ChatMessage,
    context: {
      me: string | null;
      contacts: ReadonlyMap<string, ChatContact>;
      receipts: ReadonlyMap<string, MessageReadReceipt>;
      unknownContact: string;
      isGroup: boolean;
      previousSender: string;
      delivery: MessageDelivery;
    },
  ): ThreadItem {
    const isMine = message.senderId === context.me;
    const authorName = context.contacts.get(message.senderId)?.name ?? context.unknownContact;
    const sentAt = new Date(message.sentAt).getTime();

    const isRead =
      context.delivery === 'sent' &&
      isMine &&
      [...context.receipts.values()].some(
        (receipt) => receipt.userId !== context.me && new Date(receipt.readAt).getTime() >= sentAt,
      );

    return {
      kind: 'message',
      id: message.id,
      message,
      isMine,
      authorName,
      showAuthor: context.isGroup && !isMine && context.previousSender !== message.senderId,
      isRead,
      delivery: context.delivery,
    };
  }
}
