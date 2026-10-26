import { DatePipe } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowDown,
  lucideCheck,
  lucideCheckCheck,
  lucideChevronLeft,
  lucideChevronRight,
  lucideMessageCircleMore,
  lucideMessagesSquare,
  lucideRefreshCw,
  lucideWifiOff,
} from '@ng-icons/lucide';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  ChatConnectionState,
  ConversationView,
  ThreadItem,
} from '../../../../../../core/models/chat/chat.models';
import { LanguageService } from '../../../../../../core/services/language';
import { ChatAvatarComponent } from '../chat-avatar/chat-avatar';
import { ChatComposerComponent } from '../chat-composer/chat-composer';

/** Scrolling this close to the bottom still counts as "reading the newest messages". */
const BOTTOM_THRESHOLD_PX = 120;
/** Scrolling this close to the top requests the previous page. */
const TOP_THRESHOLD_PX = 160;

/**
 * Where the reader was looking when a page of history was requested.
 *
 * Rows are plain DOM, so the browser owns layout; the anchor is the row at the
 * top edge plus its exact pixel offset, which is what has to look unchanged
 * after older messages are prepended above it.
 */
export interface ChatScrollAnchor {
  /** Row at the top edge (`data-chat-id`), or null when the thread was empty. */
  itemId: string | null;
  /** Distance from the scroller's top edge to that row, in pixels. */
  topOffset: number;
  scrollTop: number;
  scrollHeight: number;
}

@Component({
  selector: 'app-chat-thread',
  // The host owns its layout: the inner column needs a definite height, otherwise
  // the scroller collapses to 0px regardless of the call site.
  host: { class: 'flex min-h-0 flex-1 flex-col' },
  imports: [ChatAvatarComponent, ChatComposerComponent, DatePipe, NgIcon, TranslatePipe],
  templateUrl: './chat-thread.html',
  styleUrl: './chat-thread.css',
  viewProviders: [
    provideIcons({
      lucideArrowDown,
      lucideCheck,
      lucideCheckCheck,
      lucideChevronLeft,
      lucideChevronRight,
      lucideMessageCircleMore,
      lucideMessagesSquare,
      lucideRefreshCw,
      lucideWifiOff,
    }),
  ],
})
export class ChatThreadComponent {
  private readonly translate = inject(TranslateService);
  private readonly language = inject(LanguageService);
  private readonly injector = inject(Injector);
  private readonly scroller = viewChild<ElementRef<HTMLElement>>('scrollContainer');

  public readonly conversation = input<ConversationView | null>(null);
  public readonly items = input<ThreadItem[]>([]);
  public readonly isLoading = input<boolean>(false);
  public readonly hasOlder = input<boolean>(false);
  public readonly isLoadingOlder = input<boolean>(false);
  public readonly typingNames = input<string[]>([]);
  public readonly connectionState = input<ChatConnectionState>('connected');

  public readonly back = output<void>();
  public readonly loadOlder = output<void>();
  public readonly messageSent = output<string>();
  public readonly typingChange = output<boolean>();
  public readonly retryMessage = output<string>();
  public readonly reconnect = output<void>();

  /** True while the newest message is in view; drives the "jump to latest" affordance. */
  public readonly atBottom = signal(true);

  protected readonly isOffline = computed(
    () => this.connectionState() === 'reconnecting' || this.connectionState() === 'disconnected',
  );

  protected readonly typingLabel = computed(() => {
    // Recompute when the locale changes.
    this.language.lang();

    const names = this.typingNames();
    if (names.length === 0) return '';
    if (names.length === 1) {
      return this.translate.instant('CHAT.TYPING.SINGLE', { name: names[0] });
    }

    return this.translate.instant('CHAT.TYPING.MULTIPLE', { count: names.length });
  });

  protected readonly composerPlaceholder = computed(() => {
    this.language.lang();
    return this.translate.instant('CHAT.COMPOSER.PLACEHOLDER');
  });

  /** Passed to `DatePipe` so timestamps follow the live language, not bootstrap `LOCALE_ID`. */
  protected readonly lang = this.language.lang;

  protected readonly backIcon = computed(() =>
    this.language.lang() === 'ar' ? 'lucideChevronRight' : 'lucideChevronLeft',
  );

  private lastConversationId: string | null = null;
  private lastItemCount = 0;
  /** Latches a history request so one scroll position cannot fire a burst of them. */
  private olderRequestPending = false;

  constructor() {
    effect(() => {
      const conversationId = this.conversation()?.id ?? null;
      const count = this.items().length;
      const previousConversationId = this.lastConversationId;
      const previousCount = this.lastItemCount;

      this.lastConversationId = conversationId;
      this.lastItemCount = count;

      if (!conversationId || count === 0) return;

      if (previousConversationId !== conversationId) {
        // A different thread always opens on the newest message, then keeps
        // filling the viewport while the history still has more to show.
        afterNextRender(
          () => {
            this.scrollToEnd();
            if (this.hasOlder() && this.isViewportUnderfilled()) this.requestOlder();
          },
          { injector: this.injector },
        );
        return;
      }

      // Rows appended while the reader is at the bottom keep them there; someone
      // reading history is left alone instead of being yanked to the newest row.
      if (count > previousCount && untracked(() => this.atBottom())) {
        afterNextRender(() => this.scrollToEnd(), { injector: this.injector });
      }
    });

    // Release the history latch once the request settles.
    effect(() => {
      if (!this.isLoadingOlder()) this.olderRequestPending = false;
    });
  }

  protected bubbleClasses(item: Extract<ThreadItem, { kind: 'message' }>): string {
    if (!item.isMine) return 'bg-surface-subtle text-ink border border-border';

    return item.delivery === 'failed'
      ? 'bg-primary/70 text-white ring-1 ring-[var(--color-danger)] shadow-[0_2px_10px_var(--color-primary-glow)]'
      : 'bg-primary text-white shadow-[0_2px_10px_var(--color-primary-glow)]';
  }

  /** Tracks the reader's position and pulls the previous page when they reach the top. */
  protected onScroll(): void {
    const element = this.scroller()?.nativeElement;
    if (!element) return;

    this.atBottom.set(this.distanceFromBottom(element) <= BOTTOM_THRESHOLD_PX);

    if (element.scrollTop <= TOP_THRESHOLD_PX) this.requestOlder();
  }

  /** Jumps to the newest message (initial open, own send, "jump to latest"). */
  public scrollToEnd(behavior: ScrollBehavior = 'auto'): void {
    const element = this.scroller()?.nativeElement;
    if (!element) return;

    this.atBottom.set(true);
    element.scrollTo({ top: element.scrollHeight, behavior });
  }

  /** Snapshot taken right before older messages are requested. */
  public beginHistoryLoad(): ChatScrollAnchor {
    const element = this.scroller()?.nativeElement;
    if (!element) return { itemId: null, topOffset: 0, scrollTop: 0, scrollHeight: 0 };

    // Laid out eagerly until the reader is repositioned, so the prepended rows
    // report real heights instead of `contain-intrinsic-size` placeholders.
    element.classList.add('chat-measuring');

    // Read the height *after* the class forces a real layout — the baseline must
    // not still contain placeholders for the rows that are about to move down.
    const scrollHeight = element.scrollHeight;
    const elementTop = element.getBoundingClientRect().top;
    let anchorRow: HTMLElement | null = null;

    for (const row of element.querySelectorAll<HTMLElement>('[data-chat-id]')) {
      if (row.getBoundingClientRect().bottom > elementTop + 1) {
        anchorRow = row;
        break;
      }
    }

    return {
      itemId: anchorRow?.dataset['chatId'] ?? null,
      topOffset: anchorRow ? anchorRow.getBoundingClientRect().top - elementTop : 0,
      scrollTop: element.scrollTop,
      scrollHeight,
    };
  }

  /**
   * Keeps the reader near the row they were looking at after a page is prepended.
   * Everything new sits above the anchor, so the growth in scroll height restores
   * the view; one measurement pass trims the remaining pixel drift.
   */
  public restoreScrollAnchor(anchor: ChatScrollAnchor): void {
    afterNextRender(
      () => {
        const element = this.scroller()?.nativeElement;
        if (!element) return;

        const growth = element.scrollHeight - anchor.scrollHeight;
        if (growth > 0) element.scrollTop = anchor.scrollTop + growth;

        requestAnimationFrame(() => {
          const row = anchor.itemId
            ? element.querySelector<HTMLElement>(`[data-chat-id="${anchor.itemId}"]`)
            : null;

          if (row) {
            const delta =
              row.getBoundingClientRect().top -
              element.getBoundingClientRect().top -
              anchor.topOffset;

            if (Math.abs(delta) > 1) element.scrollTop += delta;
          }

          element.classList.remove('chat-measuring');
          this.atBottom.set(this.distanceFromBottom(element) <= BOTTOM_THRESHOLD_PX);
        });
      },
      { injector: this.injector },
    );
  }

  private requestOlder(): void {
    if (this.olderRequestPending || !this.hasOlder() || this.isLoadingOlder()) return;

    this.olderRequestPending = true;
    this.loadOlder.emit();
  }

  private isViewportUnderfilled(): boolean {
    const element = this.scroller()?.nativeElement;
    if (!element) return false;

    return element.scrollHeight <= element.clientHeight + BOTTOM_THRESHOLD_PX;
  }

  private distanceFromBottom(element: HTMLElement): number {
    return element.scrollHeight - element.scrollTop - element.clientHeight;
  }
}
