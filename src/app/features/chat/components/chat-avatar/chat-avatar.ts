import { Component, computed, input } from '@angular/core';
import { studentInitials } from '../../../../shared/pipes/arabic-numerals/arabic-numerals';

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
  private readonly SIZE_CLASSES = {
    sm: 'h-8 w-8 text-[0.7rem]',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  } as const;

  // shortcut: white initials assume these --color-* tokens stay dark enough; retune them if the palette changes.
  private readonly ACCENTS = [
    'bg-linear-135 from-primary to-primary-light',
    'bg-linear-135 from-purple to-primary',
    'bg-linear-135 from-mint to-primary',
    'bg-linear-135 from-coral to-primary',
    'bg-linear-135 from-star to-primary',
    'bg-linear-135 from-primary to-purple',
  ] as const;
  public readonly name = input<string>('');
  public readonly imageUrl = input<string | null>(null);
  public readonly seed = input<string>('');
  public readonly isOnline = input<boolean>(false);
  public readonly showPresence = input<boolean>(false);
  public readonly size = input<keyof typeof this.SIZE_CLASSES>('md');

  protected readonly sizeClass = computed(() => this.SIZE_CLASSES[this.size()]);

  protected readonly initials = computed(() => studentInitials(this.name()).toUpperCase() || '?');

  protected readonly accentClass = computed(() => {
    const source = this.seed() || this.name();
    let hash = 0;

    for (let index = 0; index < source.length; index += 1) {
      hash = (hash * 31 + source.charCodeAt(index)) % 360;
    }

    return this.ACCENTS[hash % this.ACCENTS.length];
  });
}
