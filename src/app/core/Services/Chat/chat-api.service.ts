import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ChatMessage,
  Conversation,
  ConversationSummary,
  CursorPage,
} from '../../models/chat/chat.models';

/**
 * REST half of the chat feature. The realtime half lives in `ChatHubService`;
 * these endpoints pre-fill the screens (conversation list + message history) and
 * are the fallback write path while the hub is offline.
 */
@Service()
export class ChatApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/chats`;

  /** `GET /chats` — every conversation the current user is a member of. */
  public getConversations(): Observable<ConversationSummary[]> {
    return this.http.get<ConversationSummary[]>(this.baseUrl);
  }

  /** `GET /chats/{id}` — conversation metadata including members. */
  public getConversation(conversationId: string): Observable<Conversation> {
    return this.http.get<Conversation>(`${this.baseUrl}/${conversationId}`);
  }

  /** `GET /chats/{id}/messages` — newest-first cursor page, returned ascending by the API. */
  public getMessages(
    conversationId: string,
    before: string | null = null,
    pageSize = 40,
  ): Observable<CursorPage<ChatMessage>> {
    let params = new HttpParams().set('pageSize', String(pageSize));
    if (before) {
      params = params.set('before', before);
    }

    return this.http.get<CursorPage<ChatMessage>>(`${this.baseUrl}/${conversationId}/messages`, {
      params,
    });
  }

  /** `POST /chats/direct` — idempotent on the backend, returns the conversation id. */
  public createDirectConversation(otherUserId: string): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/direct`, { otherUserId });
  }

  /** `POST /chats/group` — returns the new conversation id. */
  public createGroupConversation(title: string, memberIds: string[]): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/group`, { title, memberIds });
  }

  /** `POST /chats/{id}/messages` — REST fallback for sending while offline. */
  public sendMessage(conversationId: string, content: string): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/${conversationId}/messages`, { content });
  }

  /** `POST /chats/{id}/read` — REST fallback for read receipts. */
  public markAsRead(conversationId: string, lastMessageId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${conversationId}/read`, { lastMessageId });
  }
}
