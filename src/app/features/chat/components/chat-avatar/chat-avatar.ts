import { Component, computed, input } from '@angular/core';
import { studentInitials } from '../../../../shared/pipes/arabic-numerals/arabic-numerals';

const SIZE_CLASSES = {
  sm: 'h-8 w-8 text-[0.7rem]',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
} as const;

/** Static utility classes so Tailwind emits them; the index is derived from the user id. */
const ACCENTS = [
  'bg-[linear-gradient(135deg,#255086,#3b78bc)]',
  'bg-[linear-gradient(135deg,#5b4b93,#7b6bb8)]',
  'bg-[linear-gradient(135deg,#075a4f,#0f8a77)]',
  'bg-[linear-gradient(135deg,#8a3d5c,#c25b84)]',
  'bg-[linear-gradient(135deg,#7a5a12,#b98a1f)]',
  'bg-[linear-gradient(135deg,#3c5a80,#5c8ab8)]',
] as const;

/**
 * Initials avatar with an optional presence dot.
 * Colours are derived from the user id so a person keeps the same avatar
 * across sessions, themes and both panes of the messenger.
 */
@Component({
  selector: 'app-chat-avatar',
  templateUrl: './chat-avatar.html',
})
export class ChatAvatarComponent {
  public readonly name = input<string>('');
  public readonly imageUrl = input<string | null>(null);
  public readonly seed = input<string>('');
  public readonly isOnline = input<boolean>(false);
  public readonly showPresence = input<boolean>(false);
  public readonly size = input<keyof typeof SIZE_CLASSES>('md');

  protected readonly sizeClass = computed(() => SIZE_CLASSES[this.size()]);

  protected readonly initials = computed(() => studentInitials(this.name()).toUpperCase() || '?');

  protected readonly accentClass = computed(() => {
    const source = this.seed() || this.name();
    let hash = 0;

    for (let index = 0; index < source.length; index += 1) {
      hash = (hash * 31 + source.charCodeAt(index)) % 360;
    }

    return ACCENTS[hash % ACCENTS.length];
  });
}
