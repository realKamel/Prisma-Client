import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  bootstrapCalendarCheck,
  bootstrapLightningCharge,
  bootstrapPatchCheckFill,
  bootstrapStarFill,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NgmMotionDirective, type Transition } from '@scripttype/ng-motion';
import {
  ambientLoopTransition,
  blurRevealAnimate,
  blurRevealInitial,
  blurRevealTransition,
  heroEntranceInitial,
  heroEntranceTransition,
  infiniteRepeat,
  pulseLoopTransition,
} from '../../../../core/animations/motion.animations';
import { ConfigService } from '../../../../core/Services/config';

@Component({
  selector: 'app-hero',
  imports: [RouterLink, NgIcon, NgmMotionDirective],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
  viewProviders: [
    provideIcons({
      bootstrapPatchCheckFill,
      bootstrapCalendarCheck,
      bootstrapLightningCharge,
      bootstrapStarFill,
    }),
  ],
})
export class HeroComponent {
  private readonly configService = inject(ConfigService);

  protected readonly hero = computed(() => this.configService.config()?.hero);
  protected readonly entranceInitial = heroEntranceInitial;
  protected readonly infiniteRepeat = infiniteRepeat;
  protected readonly entranceTransition = heroEntranceTransition;
  protected readonly ambientTransition = ambientLoopTransition;
  protected readonly pulseTransition = pulseLoopTransition;
  protected readonly blurInitial = blurRevealInitial;
  protected readonly blurAnimate = blurRevealAnimate;

  /** Headline split: the API sends it pre-split, the single-string shape is the fallback. */
  protected readonly titleLine1 = computed(() => this.titleLines()[0]);
  protected readonly titleLine2 = computed(() => this.titleLines()[1]);

  /** Staggered blur reveal — each block unblurs just after the one above it. */
  protected readonly tagTransition: Transition = { ...blurRevealTransition, delay: 0.05 };
  protected readonly line1Transition: Transition = { ...blurRevealTransition, delay: 0.16 };
  protected readonly line2Transition: Transition = { ...blurRevealTransition, delay: 0.3 };
  protected readonly subtitleTransition: Transition = { ...blurRevealTransition, delay: 0.44 };
  protected readonly ctaTransition: Transition = { ...heroEntranceTransition, delay: 0.58 };

  private readonly titleLines = computed<readonly [string, string]>(() => {
    const hero = this.hero();
    const line1 = hero?.titleLine1?.trim();
    const line2 = hero?.titleLine2?.trim();

    if (line1 || line2) {
      return [line1 ?? '', line2 ?? ''];
    }

    const words = (hero?.title ?? '').trim().split(/\s+/).filter(Boolean);

    return [words.slice(0, 2).join(' '), words.slice(2).join(' ')];
  });
}
