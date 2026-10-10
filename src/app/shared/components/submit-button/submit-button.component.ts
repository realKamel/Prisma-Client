import { Component, computed, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorSpinnerBold } from '@ng-icons/phosphor-icons/bold';
import {
  NgmMotionDirective,
  type TargetAndTransition,
  type Transition,
} from '@scripttype/ng-motion';
import { twMerge } from 'tailwind-merge';
import { stateSwapTransition } from '../../../core/animations/motion.animations';

@Component({
  imports: [NgIcon, NgmMotionDirective],
  selector: 'app-submit-button',
  templateUrl: './submit-button.component.html',
  viewProviders: [provideIcons({ phosphorSpinnerBold })],
})
export class SubmitButtonComponent {
  public readonly clicked = output<void>();
  public readonly isLoading = input<boolean>(false);
  public readonly isDisabled = input<boolean>(true);
  public readonly buttonType = input<'button' | 'submit' | 'reset'>('button');
  protected readonly isButtonDisabled = computed(() => this.isLoading() || this.isDisabled());

  /**
   * Default look: the design system's primary pill button (same surface, glow and
   * press feedback as `.fp-btn`) with a grid layout so the label and the spinner
   * can share one cell.
   *
   * Every class is overridable through `className`; both are merged with
   * `tailwind-merge`, so the last class of a conflicting group wins
   * (e.g. `className="w-auto px-6"` shrinks the full-width default).
   */
  private readonly BUTTON_BASE =
    'grid w-full cursor-pointer place-items-center rounded-full border-none bg-primary px-8 py-4 font-sans text-base font-bold text-white shadow-[0_6px_28px_var(--color-primary-glow)] transition-shadow duration-300 enabled:hover:shadow-[0_10px_40px_rgba(var(--color-primary-rgb),0.51)] disabled:cursor-not-allowed disabled:opacity-60';

  /** Tailwind classes that restyle the button, merged over the defaults. */
  public readonly className = input<string>();

  protected readonly buttonTransition: Transition = { type: 'spring', stiffness: 420, damping: 26 };
  protected readonly swapTransition: Transition = stateSwapTransition;

  /** Hidden resting point so the spinner never flashes before the first load. */
  protected readonly spinnerHidden: TargetAndTransition = { opacity: 0, scale: 0.6 };

  /** Gesture targets fall back to rest while the button cannot be pressed. */
  protected readonly hoverTarget = computed<TargetAndTransition>(() =>
    this.isButtonDisabled() ? { scale: 1 } : { scale: 1.03 },
  );

  protected readonly tapTarget = computed<TargetAndTransition>(() =>
    this.isButtonDisabled() ? { scale: 1 } : { scale: 0.97 },
  );

  /** Label and spinner share one grid cell, so the swap never shifts the button. */
  protected readonly labelTarget = computed<TargetAndTransition>(() =>
    this.isLoading() ? { opacity: 0, scale: 0.92 } : { opacity: 1, scale: 1 },
  );

  protected readonly spinnerTarget = computed<TargetAndTransition>(() =>
    this.isLoading() ? { opacity: 1, scale: 1 } : this.spinnerHidden,
  );

  protected readonly mergedClasses = computed(() => twMerge(this.BUTTON_BASE, this.className()));
}
