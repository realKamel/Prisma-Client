import { Component } from '@angular/core';
import { NgmMotionDirective, type ViewportOptions } from '@scripttype/ng-motion';
import {
  sectionRevealEnter,
  sectionRevealExit,
  sectionRevealTransition,
} from '../../../core/animations/motion.animations';

/**
 * Wraps page content in a viewport-driven reveal that animates BOTH ways: in
 * when the block enters the viewport, back out when it leaves.
 *
 * How the two-way reveal works — and why each binding is what it is:
 *
 * - `[whileInView]` drives the enter. It uses motion's own per-element observer,
 *   so it fires when THIS block is on screen, never earlier.
 * - `[viewport]` must set `once: false`, otherwise the gesture never deactivates
 *   and there is nothing to animate back out.
 * - `[animate]` is the OUT-OF-VIEW resting state. On leave ng-motion stops the
 *   gesture animations and snaps each value to its `initial` target before
 *   deactivating `whileInView`; the leftover fallback animation then targets
 *   `animate`. Pointing `animate` at the hidden state is what turns that snap
 *   back into a real exit animation.
 * - `[initial]="false"` keeps the snap harmless: with no `initial` target the
 *   base value is the one motion read from the DOM (the visible state), so
 *   leaving the viewport animates out instead of jumping.
 *
 * The wrapper exists because section component hosts are `display: inline`,
 * which silently drops the `y` transform; `host: { class: 'block' }` gives the
 * reveal a real block box to animate.
 */
@Component({
  selector: 'app-scroll-reveal',
  imports: [NgmMotionDirective],
  host: { class: 'block' },
  templateUrl: './scroll-reveal.html',
})
export class ScrollRevealComponent {
  protected readonly revealEnter = sectionRevealEnter;
  protected readonly revealExit = sectionRevealExit;
  protected readonly revealTransition = sectionRevealTransition;

  /** Inset so enter and leave both happen while the block is partly on screen. */
  protected readonly revealViewport: ViewportOptions = {
    once: false,
    amount: 'some',
    margin: '-12% 0px -12% 0px',
  };
}
