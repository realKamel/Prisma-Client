import { Component, computed, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { phosphorMoonBold, phosphorSunBold } from '@ng-icons/phosphor-icons/bold';
import { TranslatePipe } from '@ngx-translate/core';
import { NgmMotionDirective, Transition, Variants } from '@scripttype/ng-motion';
import { ThemeService } from '../../../../../../core/Services/theme';

@Component({
  selector: 'app-theme-toggle',
  imports: [TranslatePipe, NgIcon, NgmMotionDirective],
  viewProviders: [provideIcons({ phosphorSunBold, phosphorMoonBold })],
  template: ` <button
    (click)="theme.toggle()"
    ngmMotion
    [whileHover]="{ rotate: 20 }"
    [transition]="toggleTransition"
    [attr.aria-label]="'NAVBAR.TOGGLE_THEME' | translate"
    class="border-border text-ink-subtle hover:border-border-focus hover:bg-primary relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border bg-transparent transition-colors duration-200 hover:text-white"
  >
    <ng-icon
      ngmMotion
      name="phosphorMoonBold"
      aria-hidden="true"
      class="absolute inset-0 m-auto text-[1.25rem]"
      [variants]="moonVariants"
      [initial]="iconState()"
      [animate]="iconState()"
      [transition]="iconTransition"
    />
    <ng-icon
      ngmMotion
      name="phosphorSunBold"
      aria-hidden="true"
      class="absolute inset-0 m-auto text-[1.25rem]"
      [variants]="sunVariants"
      [initial]="iconState()"
      [animate]="iconState()"
      [transition]="iconTransition"
    />
  </button>`,
})
export class ThemeToggleComponent {
  protected readonly theme = inject(ThemeService);

  /** Current variant label, shared by both icons so they swap in one frame. */
  protected readonly iconState = computed(() =>
    this.theme.theme() === 'light' ? 'light' : 'dark',
  );

  /** Moon owns dark mode: fades and spins out when the light theme takes over. */
  protected readonly moonVariants: Variants = {
    dark: { opacity: 1, rotate: 0 },
    light: { opacity: 0, rotate: 120 },
  };

  /** Sun mirrors the moon, entering from the opposite rotation. */
  protected readonly sunVariants: Variants = {
    dark: { opacity: 0, rotate: -120 },
    light: { opacity: 1, rotate: 0 },
  };

  /** Springy spin for rotate/scale, shorter tween for the cross-fade. */
  protected readonly iconTransition: Transition = {
    opacity: { duration: 0.18, ease: 'easeOut' },
    rotate: { type: 'spring', stiffness: 300, damping: 20 },
  };

  /** Hover tilt on the toggle itself (replaces the old CSS transform transition). */
  protected readonly toggleTransition: Transition = { type: 'spring', stiffness: 260, damping: 18 };
}
