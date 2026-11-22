import { Component, ElementRef, effect, viewChild } from '@angular/core';
import {
  bootstrapCheckLg,
  bootstrapPlayFill,
  bootstrapVolumeUpFill,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NgmMotionDirective, type Transition, type ViewportOptions } from '@scripttype/ng-motion';
import {
  blurRevealAnimate,
  blurRevealInitial,
  blurRevealTransition,
} from '../../../../shared/animations/motion.animations';

/** Placeholder heading. Replace the wording, or move it into the config if it should be editable. */
const HEADING = 'كل ما يحتاجه الطالب في مكان واحد';

/** The three real parts of the product, shown as a connected chain. */
const CHAIN_STEPS: readonly string[] = ['محاضرات فيديو', 'واجبات واختبارات', 'متابعة ولي الأمر'];

@Component({
  selector: 'app-product',
  imports: [NgIcon, NgmMotionDirective],
  templateUrl: './product.html',
  styleUrl: './product.css',
  viewProviders: [provideIcons({ bootstrapPlayFill, bootstrapVolumeUpFill, bootstrapCheckLg })],
})
export class ProductComponent {
  /** The chain animation waits until the strip is on screen. */
  private readonly chain = viewChild<ElementRef<HTMLElement>>('chain');

  protected readonly heading = HEADING;
  protected readonly chainSteps = CHAIN_STEPS;

  protected readonly blurInitial = blurRevealInitial;
  protected readonly blurAnimate = blurRevealAnimate;

  /** This section is below the fold, so every block reveals when it scrolls into view. */
  protected readonly headingTransition: Transition = { ...blurRevealTransition, delay: 0.05 };
  protected readonly mockTransition: Transition = { ...blurRevealTransition, delay: 0.15 };
  protected readonly chainTransition: Transition = { ...blurRevealTransition, delay: 0.05 };

  protected readonly headingViewport: ViewportOptions = { once: true, amount: 0.6 };
  protected readonly mockViewport: ViewportOptions = { once: true, amount: 0.25 };
  protected readonly chainViewport: ViewportOptions = { once: true, amount: 0.6 };

  constructor() {
    effect((onCleanup) => {
      const chain = this.chain()?.nativeElement;

      if (!chain) {
        return;
      }

      if (typeof IntersectionObserver === 'undefined') {
        chain.classList.add('is-visible');

        return;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            chain.classList.add('is-visible');
            observer.disconnect();
          }
        },
        { threshold: 0.6 },
      );

      observer.observe(chain);
      onCleanup(() => observer.disconnect());
    });
  }
}