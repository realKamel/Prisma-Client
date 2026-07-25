export enum AIChatRole {
  User = 'user',
  Assistant = 'assistant',
}
export interface ChatMessage {
  messageId: string;
  ChatRole: AIChatRole;
  messageText: string;
  timestamp: Date;
}

export interface ChatbotState {
  messages: ChatMessage[];
  isOpen: boolean;
  isStreaming: boolean;
  error: string | null;
}

export interface AIChatRequest {
  sessionId?: string;
  question: string;
}
