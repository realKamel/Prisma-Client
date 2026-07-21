import { Component, effect, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AIChatStore } from '../stores/aichat-store';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMessageCircleMore } from '@ng-icons/lucide';
import { MarkdownPipe } from '../../../core/pipes/markdown-pipe';

@Component({
  selector: 'app-ai-chat-component',
  imports: [FormsModule, MarkdownPipe],
  templateUrl: './ai-chat-component.html',
  styleUrl: './ai-chat-component.css',
  viewProviders: [provideIcons({ lucideMessageCircleMore })],
})
export class AiChatComponent {
  // Inject the centralized state store
  private readonly chatStore = inject(AIChatStore);

  // Expose store projections to template transparently as readonly fields
  readonly messages = this.chatStore.messages;
  readonly isOpen = this.chatStore.isOpen;
  readonly isStreaming = this.chatStore.isStreaming;
  readonly error = this.chatStore.error;

  protected readonly userInput = signal('');
  readonly quickQuestions = [
    'كيف أفتح درس؟',
    'كيف أرفع واجب؟',
    'فين الاختبارات؟',
    'نسيت كلمة المرور',
  ];

  private readonly messagesContainer = viewChild<ElementRef<HTMLDivElement>>('messagesContainer');

  constructor() {
    // Keep your dynamic scroll logic; it reacts automatically to store length state updates
    effect(() => {
      const element = this.messagesContainer()?.nativeElement;
      const triggerCount = this.messages().length;
      if (element && triggerCount > 0) {
        setTimeout(() => {
          element.scrollTop = element.scrollHeight;
        }, 16);
      }
    });

    // Auto-focus logic
    effect(() => {
      if (this.isOpen()) {
        setTimeout(() => {
          const inputEl = document.getElementById('chatbot-input') as HTMLInputElement;
          inputEl?.focus();
        }, 260);
      }
    });
  }

  togglePanel(): void {
    this.chatStore.togglePanel();
  }

  closePanel(): void {
    this.chatStore.closePanel();
  }

  handleQuickQuestion(question: string): void {
    if (this.isStreaming()) return;
    this.chatStore.sendUserMessage(question);
  }

  handleSend(): void {
    const cleaned = this.userInput().trim();
    if (!cleaned || this.isStreaming()) return;

    this.userInput.set(''); // Instantly clear view input
    this.chatStore.sendUserMessage(cleaned);
  }
}
