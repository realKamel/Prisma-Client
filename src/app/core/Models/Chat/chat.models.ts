/**
 * Chat contracts mirrored from the backend (`Prisma.Application.Features.Chats.Dtos`).
 * System.Text.Json serializes them with camelCase keys, so the shapes below match
 * the SignalR payloads and the REST responses one-to-one.
 */

/** Mirrors `Prisma.Domain.Enums.ConversationType`. */
export enum ConversationType {
  Direct = 1,
  Group = 2,
}

/** Mirrors `Prisma.Domain.Enums.ConversationRole`. */
export enum ConversationRole {
  Member = 0,
  Admin = 1,
}

/** Lifecycle of the SignalR connection, surfaced by the UI. */
export type ChatConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

/** `ChatMessageDto` — pushed through `ReceiveMessage`. */
export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  sentAt: string;
}

/** `ConversationSummaryDto` — the conversation list endpoint. */
export interface ConversationSummary {
  id: string;
  type: ConversationType;
  title: string | null;
  createdAt: string | null;
  lastMessageAt: string | null;
  lastMessageContent: string | null;
  lastMessageSenderId: string | null;
  unreadCount: number;
  memberUserIds: string[];
}

/** `ConversationMemberDto`. */
export interface ConversationMember {
  userId: string;
  role: ConversationRole;
  joinedAt: string;
  lastReadMessageId: string | null;
  lastReadAt: string | null;
}

/** `ConversationDto`. */
export interface Conversation {
  id: string;
  type: ConversationType;
  title: string | null;
  createdAt: string | null;
  members: ConversationMember[];
}

/** `CursorPagedResult<T>` — timestamp cursor over the message history. */
export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

/** `MessageReadReceiptDto` — pushed through `MessageRead`. */
export interface MessageReadReceipt {
  conversationId: string;
  userId: string;
  lastReadMessageId: string;
  readAt: string;
}

/** `TypingIndicatorDto` — pushed through `UserTyping`. */
export interface TypingIndicator {
  conversationId: string;
  userId: string;
  isTyping: boolean;
  occurredAt: string;
}

/** `UnreadCountDto` — pushed through `UnreadCountUpdated`. */
export interface UnreadCount {
  conversationId: string;
  unreadCount: number;
}

/** `PresenceChangedDto` — pushed through `UserPresenceChanged`. */
export interface PresenceChange {
  userId: string;
  isOnline: boolean;
  occurredAt: string;
}

/** A resolvable chat participant (directory entry). */
export interface ChatContact {
  userId: string;
  name: string;
  role: string | null;
  subtitle: string | null;
  avatarUrl: string | null;
}

/** A conversation merged with directory + presence data, ready for rendering. */
export interface ConversationView {
  id: string;
  type: ConversationType;
  title: string;
  subtitle: string | null;
  preview: string;
  lastMessageAt: string | null;
  unreadCount: number;
  isOnline: boolean;
  avatarUrl: string | null;
  isGroup: boolean;
  participantIds: string[];
}

/** Delivery state of a message the viewer wrote. */
export type MessageDelivery = 'sent' | 'sending' | 'failed';

/** A locally written message the server has not acknowledged yet. */
export interface PendingMessage {
  /** Local id, never sent to the server. */
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  sentAt: string;
  delivery: 'sending' | 'failed';
}

/** One row of the virtualised thread: either a day divider or a message bubble. */
export type ThreadItem =
  | {
      kind: 'date';
      id: string;
      /** ISO timestamp of the first message of the day. */
      at: string;
      /** Set for the two relative days a chat labels instead of printing a date. */
      labelKey: 'CHAT.TODAY' | 'CHAT.YESTERDAY' | null;
    }
  | {
      kind: 'message';
      id: string;
      message: ChatMessage;
      isMine: boolean;
      authorName: string;
      showAuthor: boolean;
      isRead: boolean;
      /** `sending`/`failed` only for rows that exist locally so far. */
      delivery: MessageDelivery;
    };
