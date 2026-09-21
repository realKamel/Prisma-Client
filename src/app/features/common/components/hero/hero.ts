import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  bootstrapBookFill,
  bootstrapCalculatorFill,
  bootstrapCalendarCheck,
  bootstrapClock,
  bootstrapFlaskFill,
  bootstrapLightningCharge,
  bootstrapPatchCheckFill,
  bootstrapPlayFill,
  bootstrapStarFill,
  bootstrapTranslate,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  NgmMotionDirective,
  type TargetAndTransition,
  type Transition,
  type ViewportOptions,
} from '@scripttype/ng-motion';
import {
  blurRevealAnimate,
  blurRevealInitial,
  blurRevealTransition,
  cardRevealTransition,
  infiniteRepeat,
  pulseLoopTransition,
} from '../../../../core/animations/motion.animations';
import type { Badge } from '../../../../core/Models/platform-config';
import { ConfigService } from '../../../../core/Services/config';

/**
 * Fallbacks for the four floating preview cards. Each corner needs one icon plus
 * one label, while the API only guarantees a badge list of arbitrary length, so
 * every card falls back to the platform default on a short list.
 */
const CARD_BADGE_FALLBACKS: readonly Badge[] = [
  { icon: 'bootstrapPatchCheckFill', text: 'درجة كاملة' },
  { icon: 'bootstrapCalendarCheck', text: 'درسك الجاي جاهز' },
  { icon: 'bootstrapLightningCharge', text: '٢٤٨ طالب نشط' },
  { icon: 'bootstrapStarFill', text: 'تقييم ٥ من ٥' },
];

/** Subject glyphs for the "all subjects in one place" card. */
const SUBJECT_ICONS: readonly string[] = [
  'bootstrapCalculatorFill',
  'bootstrapFlaskFill',
  'bootstrapBookFill',
  'bootstrapTranslate',
];

@Component({
  selector: 'app-hero',
  imports: [RouterLink, NgIcon, NgmMotionDirective],
  templateUrl: './hero.html',
  viewProviders: [
    provideIcons({
      bootstrapPatchCheckFill,
      bootstrapCalendarCheck,
      bootstrapLightningCharge,
      bootstrapStarFill,
      bootstrapClock,
      bootstrapPlayFill,
      bootstrapCalculatorFill,
      bootstrapFlaskFill,
      bootstrapBookFill,
      bootstrapTranslate,
    }),
  ],
})
export class HeroComponent {
  private readonly configService = inject(ConfigService);

  protected readonly hero = computed(() => this.configService.config()?.hero);

  /** One icon plus one label per floating card, tolerant of a short badge list. */
  protected readonly cardBadges = computed<readonly Badge[]>(() => {
    const badges = this.hero()?.badges ?? [];

    return CARD_BADGE_FALLBACKS.map((fallback, index) => badges[index] ?? fallback);
  });

  protected readonly subjectIcons = SUBJECT_ICONS;

  protected readonly infiniteRepeat = infiniteRepeat;
  protected readonly pulseTransition = pulseLoopTransition;
  protected readonly blurInitial = blurRevealInitial;
  protected readonly blurAnimate = blurRevealAnimate;

  /** Staggered blur reveal: each block unblurs just after the one above it. */
  protected readonly tagTransition: Transition = { ...blurRevealTransition, delay: 0.05 };
  protected readonly markTransition: Transition = { ...blurRevealTransition, delay: 0.16 };
  protected readonly line1Transition: Transition = { ...blurRevealTransition, delay: 0.28 };
  protected readonly line2Transition: Transition = { ...blurRevealTransition, delay: 0.4 };
  protected readonly subtitleTransition: Transition = { ...blurRevealTransition, delay: 0.52 };
  protected readonly ctaTransition: Transition = { ...blurRevealTransition, delay: 0.64 };

  /**
   * Floating preview cards. Each card is two motion layers: an outer element that
   * owns the reveal / exit (opacity + retract) and an inner one that owns the tilt
   * and the endless float.
   *
   * The exit rides on `[animate]` on purpose: on leaving the viewport ng-motion
   * stops the `whileInView` gesture, and the fallback animation targets `animate`,
   * so pointing it at the hidden state is what turns the leave into a real exit
   * animation. `[initial]="false"` keeps that handover from snapping.
   *
   * The cards retract towards the hero centre (top cards sink, bottom cards lift)
   * so the exit stays visible whichever edge they leave through, while the tilt
   * grows a little before the fade finishes.
   */
  protected readonly noteCardExit: TargetAndTransition = { opacity: 0, y: 24, rotate: -6 };
  protected readonly reminderCardExit: TargetAndTransition = { opacity: 0, y: 20, rotate: 5 };
  protected readonly progressCardExit: TargetAndTransition = { opacity: 0, y: -22, rotate: 4 };
  protected readonly subjectsCardExit: TargetAndTransition = { opacity: 0, y: -18, rotate: -5 };

  /** On-screen resting state of a card (the resting tilt lives on the inner layer). */
  protected readonly cardEnter: TargetAndTransition = { opacity: 1, y: 0, rotate: 0 };

  /**
   * A card only counts as in view while most of it is on screen, otherwise the
   * exit would not fire until the card had already scrolled out of sight.
   */
  protected readonly cardViewport: ViewportOptions = { once: false, amount: 0.75 };

  protected readonly cardRevealTransition = cardRevealTransition;

  /** Headline split: the API sends it pre-split, the single-string shape is the fallback. */
  protected readonly titleLine1 = computed(() => this.titleLines()[0]);
  protected readonly titleLine2 = computed(() => this.titleLines()[1]);

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
