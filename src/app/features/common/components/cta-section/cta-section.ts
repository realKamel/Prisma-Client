import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  contentEntranceAnimate,
  contentEntranceInitial,
  contentEntranceTransition,
  scaleEntranceAnimate,
  scaleEntranceInitial,
} from '../../../../core/animations/motion.animations';
import { lucideRocket } from '@ng-icons/lucide';
@Component({
  selector: 'app-cta-section',
  imports: [RouterLink, NgIcon, NgmMotionDirective],
  templateUrl: './cta-section.html',
  viewProviders: [provideIcons({ lucideRocket })],
})
export class CtaSectionComponent {
  protected readonly entranceInitial = contentEntranceInitial;
  protected readonly entranceVisible = contentEntranceAnimate;
  protected readonly scaleInitial = scaleEntranceInitial;
  protected readonly scaleVisible = scaleEntranceAnimate;
  protected readonly entranceTransition = contentEntranceTransition;
  protected readonly viewport = { once: true, amount: 0.2 } as const;
}
