import { Component, computed, inject, input, output, signal } from '@angular/core';
import { bootstrapSearch, bootstrapX } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideInbox, lucideMessageCircleMore, lucideSquarePen } from '@ng-icons/lucide';
import { TranslatePipe } from '@ngx-translate/core';
import { ConversationView } from '../../../../../../core/models/chat/chat.models';
import { normalizeForSearch } from '../../../../../../core/services/chat/chat-policy';
import { LanguageService } from '../../../../../../core/services/language';
import { RelativeTimePipe } from '../../../../../../shared/pipes/relative-time.pipe';
import { ChatAvatarComponent } from '../chat-avatar/chat-avatar';

type ConversationFilter = 'all' | 'unread';

@Component({
  selector: 'app-conversation-list',
  host: { class: 'flex min-h-0 flex-1 flex-col' },
  imports: [ChatAvatarComponent, NgIcon, RelativeTimePipe, TranslatePipe],
  templateUrl: './conversation-list.html',
  styleUrl: './conversation-list.css',
  viewProviders: [
    provideIcons({
      bootstrapSearch,
      bootstrapX,
      lucideInbox,
      lucideMessageCircleMore,
      lucideSquarePen,
    }),
  ],
})
export class ConversationListComponent {
  private readonly language = inject(LanguageService);

  public readonly conversations = input.required<ConversationView[]>();
  public readonly activeId = input<string | null>(null);
  public readonly isLoading = input<boolean>(false);
  public readonly hasLoaded = input<boolean>(false);
  public readonly totalUnread = input<number>(0);

  public readonly selectConversation = output<string>();
  public readonly composeConversation = output<void>();

  protected readonly searchTerm = signal('');
  protected readonly filter = signal<ConversationFilter>('all');

  protected readonly filtered = computed<ConversationView[]>(() => {
    const term = normalizeForSearch(this.searchTerm());
    const onlyUnread = this.filter() === 'unread';

    return this.conversations().filter((conversation) => {
      if (onlyUnread && conversation.unreadCount === 0) return false;
      if (!term) return true;

      return normalizeForSearch(`${conversation.title} ${conversation.preview}`).includes(term);
    });
  });

  protected readonly unreadConversations = computed(
    () => this.conversations().filter((conversation) => conversation.unreadCount > 0).length,
  );

  /** Fed to `relativeTime` so the label follows the live language, not bootstrap `LOCALE_ID`. */
  protected readonly lang = this.language.lang;

  protected rowClasses(conversationId: string): string {
    return this.activeId() === conversationId
      ? 'bg-primary/15 ring-1 ring-[var(--color-border-focus)]'
      : 'hover:bg-surface-subtle';
  }

  protected onSearchInput(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  protected clearSearch(): void {
    this.searchTerm.set('');
  }

  protected selectFilter(filter: ConversationFilter): void {
    this.filter.set(filter);
  }
}
