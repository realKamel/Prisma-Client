import { computed, DestroyRef, inject, Service, signal } from '@angular/core';
import { AIChatRequest, AIChatRole, ChatbotState, ChatMessage } from '../models/ai-models';
import { Subscription } from 'rxjs';
import { AiChatServices } from '../services/ai-chat-services/ai-chat-services';

@Service()
export class AIChatStore {
  private readonly aiChatService = inject(AiChatServices);
  private readonly destroyRef = inject(DestroyRef);
  private activeStreamSubscription: Subscription | null = null;

  // 1. Internal Writable State
  private readonly state = signal<ChatbotState>({
    messages: [],
    isOpen: false,
    isStreaming: false,
    error: null,
  });

  // 2. Public Read-Only Projections
  readonly messages = computed(() => this.state().messages);
  readonly isOpen = computed(() => this.state().isOpen);
  readonly isStreaming = computed(() => this.state().isStreaming);
  readonly error = computed(() => this.state().error);

  // Fallback to track a persistent or dynamic backend session id
  private currentSessionId?: string;

  constructor() {
    // Safety fallback: Clean up any leak if the app/component context gets destroyed
    this.destroyRef.onDestroy(() => this.cancelActiveStream());
  }

  togglePanel(): void {
    this.updateState({ isOpen: !this.state().isOpen });
  }

  closePanel(): void {
    this.updateState({ isOpen: false });
  }

  openPanel(): void {
    this.updateState({ isOpen: true });
  }

  cancelActiveStream(): void {
    if (this.activeStreamSubscription) {
      this.activeStreamSubscription.unsubscribe();
      this.activeStreamSubscription = null;
    }
  }

  sendUserMessage(content: string): void {
    const cleanInput = content.trim();

    // 1.Check the signal state or a local execution context
    if (!cleanInput || this.state().isStreaming) {
      console.warn('Blocked a duplicate parallel stream invocation request.');
      return;
    }

    // 2.Immediately flip the signal state synchronously
    // before building any objects or changing message listings.
    this.state.update((current) => ({ ...current, isStreaming: true, error: null }));

    // 3. Clear existing stream references safely now
    this.cancelActiveStream();

    const userMsg: ChatMessage = {
      messageId: crypto.randomUUID(),
      ChatRole: AIChatRole.User,
      messageText: content,
      timestamp: new Date(),
    };

    const botMsgId = crypto.randomUUID();
    const botMsgPlaceholder: ChatMessage = {
      messageId: botMsgId,
      ChatRole: AIChatRole.Assistant,
      messageText: '',
      timestamp: new Date(),
    };

    // 4. Update message layout state safely
    this.updateState({
      messages: [...this.state().messages, userMsg, botMsgPlaceholder],
    });

    const requestPayload: AIChatRequest = {
      question: cleanInput,
      sessionId: this.currentSessionId,
    };

    this.activeStreamSubscription = this.aiChatService.streamAiResponse(requestPayload).subscribe({
      next: (sseRawData) => {
        try {
          const responseEnvelope = JSON.parse(sseRawData);
          const dataPayload = responseEnvelope?.Data || responseEnvelope?.data;

          if (!dataPayload) return;

          const incomingSessionId = dataPayload.SessionId || dataPayload.sessionId;
          const incomingAnswer = dataPayload.Answer || dataPayload.answer;

          if (incomingSessionId && !this.currentSessionId) {
            this.currentSessionId = incomingSessionId;
          }

          if (incomingAnswer === '[DONE]') {
            this.updateState({ isStreaming: false });
            this.cancelActiveStream();
            return;
          }

          if (incomingAnswer) {
            this.mutateMessageContent(botMsgId, incomingAnswer);
          }
        } catch (parseError) {
          if (sseRawData === '[DONE]') {
            this.updateState({ isStreaming: false });
            this.cancelActiveStream();
            return;
          }

          if (sseRawData) {
            this.mutateMessageContent(botMsgId, sseRawData);
          }
        }
      },
      error: (err) => {
        console.error('SSE Stream Failure Context:', err);
        this.updateState({
          error: 'حدث خطأ أثناء الاتصال بالخادم.',
          isStreaming: false,
        });
        this.cancelActiveStream();
      },
      complete: () => {
        this.updateState({ isStreaming: false });
        this.cancelActiveStream();
      },
    });
  }

  private mutateMessageContent(id: string, incomingChunk: string): void {
    this.state.update((current) => ({
      ...current,
      messages: current.messages.map((m) =>
        m.messageId === id ? { ...m, messageText: m.messageText + incomingChunk } : m,
      ),
    }));
  }

  private updateState(partial: Partial<ChatbotState>): void {
    this.state.update((current) => ({ ...current, ...partial }));
  }
}
