import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideRocket } from '@ng-icons/lucide';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import {
  blurRevealAnimate,
  blurRevealInitial,
  blurRevealTransition,
  contentEntranceAnimate,
  contentEntranceInitial,
  contentEntranceTransition,
  fadeAnimate,
  fadeInitial,
  scaleEntranceAnimate,
  scaleEntranceInitial,
} from '../../../../core/animations/motion.animations';
@Component({
  selector: 'app-cta-section',
  imports: [RouterLink, NgIcon, NgmMotionDirective],
  templateUrl: './cta-section.html',
  viewProviders: [provideIcons({ lucideRocket })],
})
export class CtaSectionComponent {
  protected readonly fadeInitial = fadeInitial;
  protected readonly fadeVisible = fadeAnimate;
  protected readonly blurInitial = blurRevealInitial;
  protected readonly blurVisible = blurRevealAnimate;
  protected readonly blurTransition = blurRevealTransition;
  protected readonly entranceInitial = contentEntranceInitial;
  protected readonly entranceVisible = contentEntranceAnimate;
  protected readonly scaleInitial = scaleEntranceInitial;
  protected readonly scaleVisible = scaleEntranceAnimate;
  protected readonly entranceTransition = contentEntranceTransition;
  /** `once: false` keeps the whileInView gesture live so blocks animate back out. */
  protected readonly viewport = { once: false, amount: 0.2 } as const;
}
