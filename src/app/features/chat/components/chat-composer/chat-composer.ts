import { Component, computed, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { bootstrapSendFill } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { TranslatePipe } from '@ngx-translate/core';

/** Mirrors `Conversation.MaxMessageLength` on the backend. */
const MAX_LENGTH = 4000;
/** Idle delay after which the "is typing" heartbeat is withdrawn. */
const TYPING_IDLE_MS = 1800;

@Component({
  selector: 'app-chat-composer',
  imports: [NgIcon, TranslatePipe],
  templateUrl: './chat-composer.html',
  viewProviders: [provideIcons({ bootstrapSendFill })],
})
export class ChatComposerComponent {
  private readonly textarea = viewChild<ElementRef<HTMLTextAreaElement>>('textarea');

  public readonly disabled = input<boolean>(false);
  public readonly placeholder = input<string>('');

  public readonly messageSent = output<string>();
  public readonly typingChange = output<boolean>();

  protected readonly maxLength = MAX_LENGTH;
  protected readonly text = signal('');
  protected readonly canSend = computed(() => !this.disabled() && this.text().trim().length > 0);
  protected readonly showCounter = computed(() => this.text().length > MAX_LENGTH - 500);

  private idleTimer: ReturnType<typeof setTimeout> | null = null;
  private typingActive = false;

  protected onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.text.set(target.value);
    this.resize(target);

    if (target.value.trim().length === 0) {
      this.stopTyping();
      return;
    }

    this.startTyping();
    this.scheduleIdleStop();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' || event.shiftKey || event.isComposing) return;

    event.preventDefault();
    this.submit();
  }

  protected submit(): void {
    if (!this.canSend()) return;

    this.messageSent.emit(this.text().trim());
    this.text.set('');
    this.stopTyping();
    this.resetHeight();
  }

  private startTyping(): void {
    if (this.typingActive) return;

    this.typingActive = true;
    this.typingChange.emit(true);
  }

  private stopTyping(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }

    if (!this.typingActive) return;

    this.typingActive = false;
    this.typingChange.emit(false);
  }

  private scheduleIdleStop(): void {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => this.stopTyping(), TYPING_IDLE_MS);
  }

  private resize(target: HTMLTextAreaElement): void {
    target.style.height = 'auto';
    target.style.height = `${Math.min(target.scrollHeight, 144)}px`;
  }

  private resetHeight(): void {
    const element = this.textarea()?.nativeElement;
    if (element) element.style.height = 'auto';
  }
}
