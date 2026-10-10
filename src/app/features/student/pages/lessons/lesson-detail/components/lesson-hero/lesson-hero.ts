import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import {
  NgmMotionDirective,
  type TargetAndTransition,
  type Transition,
  type ViewportOptions,
} from '@scripttype/ng-motion';
import { LessonResponse } from '../../../../../../../core/Models/lesson.model';
import { LanguageService } from '../../../../../../../core/Services/language';

/** Horizontal marquee speed, in CSS pixels per second. */
const MARQUEE_SPEED = 80;
const MARQUEE_MIN_SECONDS = 12;
const MARQUEE_MAX_SECONDS = 30;

@Component({
  selector: 'app-lesson-hero',
  imports: [NgmMotionDirective],
  templateUrl: './lesson-hero.html',
  styleUrl: './lesson-hero.css',
})
export class LessonHeroComponent {
  protected readonly imageError = signal(false);

  public readonly lesson = input.required<LessonResponse>();

  private readonly language = inject(LanguageService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly titleViewport = viewChild.required<ElementRef<HTMLElement>>('titleViewport');
  private readonly titleLead = viewChild.required<ElementRef<HTMLElement>>('titleLead');

  private readonly isRtl = computed(() => this.language.lang() === 'ar');

  /** True once the title is wider than the card, which is what starts the marquee. */
  protected readonly titleOverflows = signal(false);

  /** One marquee loop: a single copy of the title plus its trailing gap, in px. */
  private readonly titlePitch = signal(0);

  /**
   * Half on screen is enough to run, and `once: false` is what lets the gesture
   * deactivate again. `whileInView` rather than `animate`: an infinite animation
   * on `animate` keeps burning CPU once the reader scrolls past the hero, which
   * WAAPI cannot throttle on its own.
   */
  protected readonly marqueeViewport: ViewportOptions = { once: false, amount: 0.5 };

  /**
   * Where one loop travels to, or `undefined` while the title fits — no gesture
   * target means no animation at all, so a fitting title never holds an infinite
   * timeline. `x` is a physical transform, so Arabic has to travel the other way
   * for its hidden tail (which sits on the left) to arrive in reading order.
   */
  protected readonly marqueeTarget = computed<TargetAndTransition | undefined>(() => {
    const pitch = this.titlePitch();
    if (!this.titleOverflows() || pitch <= 0) {
      return undefined;
    }
    return { x: this.isRtl() ? pitch : -pitch };
  });

  /** A constant speed keeps long and short titles equally readable. */
  protected readonly marqueeTransition = computed<Transition>(() => ({
    duration: Math.min(
      MARQUEE_MAX_SECONDS,
      Math.max(MARQUEE_MIN_SECONDS, this.titlePitch() / MARQUEE_SPEED),
    ),
    ease: 'linear',
    repeat: Infinity,
  }));

  constructor() {
    afterNextRender(() => {
      const viewport = this.titleViewport().nativeElement;
      const lead = this.titleLead().nativeElement;

      // The lead copy lays out with `white-space: nowrap` inside a full-width
      // viewport, so its border-box width is the title's natural width and the
      // only thing that decides whether the marquee runs.
      //
      // Both sides are read as LAYOUT widths (`offsetWidth`/`clientWidth`), never
      // via `getBoundingClientRect()`: the first measurement lands inside the
      // card's 700ms `cardIn` entrance, which animates `scale(0.97)` on an
      // ancestor. A transformed reading would be ~3% off, and nothing would ever
      // correct it afterwards — the entry animation changes no layout size, so
      // the ResizeObserver would not fire again.
      const measure = (): void => {
        const gap = Number.parseFloat(getComputedStyle(lead).marginInlineEnd) || 0;
        const titleWidth = lead.offsetWidth;

        this.titleOverflows.set(titleWidth - viewport.clientWidth > 1);
        this.titlePitch.set(titleWidth + gap);
      };

      const observer = new ResizeObserver(measure);
      observer.observe(viewport);
      // Also watched so a changed lesson (or a late web-font swap) re-measures.
      observer.observe(lead);

      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
