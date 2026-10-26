import { Service, signal } from '@angular/core';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ChatConnectionState,
  ChatMessage,
  MessageReadReceipt,
  PresenceChange,
  TypingIndicator,
  UnreadCount,
} from '../../models/chat/chat.models';

/**
 * Transport-only wrapper around the `/hubs/chat` SignalR hub.
 *
 * Server contract (`IChatHubClient`):
 *   ReceiveMessage · MessageRead · UserTyping · UnreadCountUpdated · UserPresenceChanged
 * Client methods (`ChatHub`):
 *   JoinConversation · LeaveConversation · SendMessage · MarkAsRead · SendTypingIndicator
 *
 * Authentication rides on the HttpOnly access-token cookie, so no
 * `accessTokenFactory` is required — the WebSocket handshake carries it.
 */
@Service()
export class ChatHubService {
  /** Connection lifecycle exposed as a signal for the UI badges. */
  public readonly state = signal<ChatConnectionState>('disconnected');

  /** Last transport error, cleared on a successful (re)connect. */
  public readonly lastError = signal<string | null>(null);

  private readonly messageSubject = new Subject<ChatMessage>();
  private readonly readReceiptSubject = new Subject<MessageReadReceipt>();
  private readonly typingSubject = new Subject<TypingIndicator>();
  private readonly unreadCountSubject = new Subject<UnreadCount>();
  private readonly presenceSubject = new Subject<PresenceChange>();
  private readonly reconnectedSubject = new Subject<void>();

  public readonly messages$: Observable<ChatMessage> = this.messageSubject.asObservable();
  public readonly readReceipts$: Observable<MessageReadReceipt> =
    this.readReceiptSubject.asObservable();
  public readonly typing$: Observable<TypingIndicator> = this.typingSubject.asObservable();
  public readonly unreadCounts$: Observable<UnreadCount> = this.unreadCountSubject.asObservable();
  public readonly presence$: Observable<PresenceChange> = this.presenceSubject.asObservable();
  public readonly reconnected$: Observable<void> = this.reconnectedSubject.asObservable();

  private connection: HubConnection | null = null;
  private startPromise: Promise<void> | null = null;

  public get isConnected(): boolean {
    return this.connection?.state === HubConnectionState.Connected;
  }

  /** Opens the connection. Safe to call repeatedly — concurrent calls share one attempt. */
  public connect(): Promise<void> {
    if (this.isConnected) return Promise.resolve();
    if (this.startPromise) return this.startPromise;

    this.state.set('connecting');

    const connection = this.buildConnection();
    this.connection = connection;

    this.startPromise = connection
      .start()
      .then(() => {
        this.lastError.set(null);
        this.state.set('connected');
      })
      .catch((error: unknown) => {
        this.connection = null;
        this.state.set('disconnected');
        this.lastError.set(error instanceof Error ? error.message : String(error));
        throw error;
      })
      .finally(() => {
        this.startPromise = null;
      });

    return this.startPromise;
  }

  /** Closes the connection and forgets it, so the next `connect()` starts clean. */
  public async disconnect(): Promise<void> {
    const connection = this.connection;
    this.connection = null;
    this.startPromise = null;
    this.state.set('disconnected');

    if (!connection) return;

    try {
      await connection.stop();
    } catch {
      // Stopping an already-dead socket throws; the state is already reset.
    }
  }

  public async joinConversation(conversationId: string): Promise<void> {
    await this.invoke('JoinConversation', conversationId);
  }

  public async leaveConversation(conversationId: string): Promise<void> {
    await this.invoke('LeaveConversation', conversationId);
  }

  public async sendMessage(conversationId: string, content: string): Promise<void> {
    await this.invoke('SendMessage', conversationId, content);
  }

  public async markAsRead(conversationId: string, lastMessageId: string): Promise<void> {
    await this.invoke('MarkAsRead', conversationId, lastMessageId);
  }

  public async sendTyping(conversationId: string, isTyping: boolean): Promise<void> {
    await this.invoke('SendTypingIndicator', conversationId, isTyping);
  }

  private async invoke(method: string, ...args: unknown[]): Promise<void> {
    const connection = this.connection;

    if (!connection || connection.state !== HubConnectionState.Connected) {
      throw new Error(`Cannot call '${method}' while the chat connection is offline.`);
    }

    await connection.invoke(method, ...args);
  }

  private buildConnection(): HubConnection {
    const connection = new HubConnectionBuilder()
      .withUrl(environment.chatHubUrl, { withCredentials: true })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (context) => {
          if (context.previousRetryCount >= 8) return null;
          return Math.min(1_000 * 2 ** context.previousRetryCount, 20_000);
        },
      })
      .configureLogging(LogLevel.Warning)
      .build();

    connection.on('ReceiveMessage', (message: ChatMessage) => this.messageSubject.next(message));
    connection.on('MessageRead', (receipt: MessageReadReceipt) =>
      this.readReceiptSubject.next(receipt),
    );
    connection.on('UserTyping', (indicator: TypingIndicator) => this.typingSubject.next(indicator));
    connection.on('UnreadCountUpdated', (update: UnreadCount) =>
      this.unreadCountSubject.next(update),
    );
    connection.on('UserPresenceChanged', (presence: PresenceChange) =>
      this.presenceSubject.next(presence),
    );

    connection.onreconnecting((error) => {
      this.lastError.set(error?.message ?? null);
      this.state.set('reconnecting');
    });

    connection.onreconnected(() => {
      this.lastError.set(null);
      this.state.set('connected');
      this.reconnectedSubject.next();
    });

    connection.onclose((error) => {
      this.state.set('disconnected');
      this.connection = null;
      if (error) this.lastError.set(error.message);
    });

    return connection;
  }
}
