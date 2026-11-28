import { computed, inject, Service, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, distinctUntilChanged, EMPTY, map, of, switchMap, tap, take } from 'rxjs';

import { AuthStore } from '../../stores/auth.store';
import { TourKey, TourState, TourStep } from '../../models/tour.model';
import { driver, type Config, type DriveStep } from 'driver.js';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';

/** Sparkles that rise from the final button. Lives on <body>, so it outlasts the popover. */
function burst(rect: DOMRect): void {
  if (!rect.width) return;

  const host = document.createElement('div');
  host.className = 'tour-burst';
  host.style.left = `${rect.left + rect.width / 2}px`;
  host.style.top = `${rect.top + rect.height / 2}px`;

  for (let i = 0; i < 14; i++) {
    const spark = document.createElement('i');
    spark.style.setProperty('--ember-x', `${Math.round((Math.random() - 0.5) * 120)}px`);
    spark.style.setProperty('--d', `${Math.round(Math.random() * 160)}ms`);
    host.append(spark);
  }

  document.body.append(host);
  setTimeout(() => host.remove(), 1200);
}
const digitsFor = (n: number, lang: string) =>
  n.toLocaleString(lang === 'ar' ? 'ar-EG' : lang);

const COMMON_KEYS = {
  next: 'TOUR.COMMON.NEXT',
  previous: 'TOUR.COMMON.PREVIOUS',
  done: 'TOUR.COMMON.DONE',
  skip: 'TOUR.COMMON.SKIP',
  progress: 'TOUR.COMMON.PROGRESS',
} as const;

@Service()
export class TourService {
  private readonly http = inject(HttpClient);
  private readonly authStore = inject(AuthStore);

  private readonly endpoint = `${environment.apiUrl}/tours`;
  private readonly translate = inject(TranslateService);

  /** Set while translations load, so a destroy() can cancel a start in flight. */
  private pendingStart: symbol | null = null;
  private readonly _state = signal<TourState>({
    userId: null,
    status: 'idle',
    seenTours: new Set(),
  });

  readonly state = this._state.asReadonly();
  readonly status = computed(() => this._state().status);
  readonly seenTours = computed(() => this._state().seenTours);

  readonly isReady = computed(
    () => this._state().status === 'ready',
  );

  private activeTour: {
    instance: ReturnType<typeof driver>;
    shouldMarkSeen: boolean;
  } | null = null;

  constructor() {
    toObservable(this.authStore.user)
      .pipe(
        distinctUntilChanged(
          (previous, current) => previous?.id === current?.id,
        ),

        tap((user) => {
          // Never let a previous user's tour survive an identity change.
          this.destroy(false);

          this._state.set({
            userId: user?.id ?? null,
            status: user ? 'loading' : 'idle',
            seenTours: new Set(),
          });
        }),

        switchMap((user) => {
          if (!user) return EMPTY;

          return this.http.get<string[]>(this.endpoint).pipe(
            map(
              (seenTours): TourState => ({
                userId: user.id,
                status: 'ready',
                seenTours: new Set(seenTours),
              }),
            ),

            catchError(() =>
              of<TourState>({
                userId: user.id,
                status: 'failed',
                seenTours: new Set(),
              }),
            ),
          );
        }),

        takeUntilDestroyed(),
      )
      .subscribe((state) => {
        this._state.set(state);
      });
  }
  start(tourKey: TourKey, candidates: TourStep[]): boolean {
    const steps = candidates.filter((s) => {
      const el = document.querySelector(s.element);
      return !!el && el.getBoundingClientRect().height > 0;
    });
    const user = this.authStore.user();

    if (!this.canStart(tourKey, steps.length, user?.id)) return false;

    this.destroy(false);
    const token = Symbol(tourKey);
    this.pendingStart = token;

    const keys = [
      ...Object.values(COMMON_KEYS),
      ...steps.flatMap((s) => [s.titleKey, s.descriptionKey]),
    ];

    this.translate
      .get(keys)
      .pipe(take(1))
      .subscribe((t: Record<string, string>) => {
        if (this.pendingStart !== token) return; // cancelled meanwhile
        this.pendingStart = null;

        // The user or seen-list may have changed while translations loaded.
        const current = this.authStore.user()?.id;
        if (!this.canStart(tourKey, steps.length, current)) return;

        this.run(tourKey, steps, t, current);
      });

    return true; // scheduled; the tour begins once translations resolve
  }

  destroy(markSeen = false): void {
    this.pendingStart = null;

    const active = this.activeTour;
    if (!active) return;

    active.shouldMarkSeen = markSeen;
    this.activeTour = null;
    active.instance.destroy();
  }

  private canStart(
    tourKey: TourKey,
    stepCount: number,
    userId: string | undefined,
  ): userId is string {
    const state = this._state();

    return (
      !!userId &&
      stepCount > 0 &&
      state.status === 'ready' &&
      state.userId === userId &&
      !state.seenTours.has(tourKey)
    );
  }

  private run(
    tourKey: TourKey,
    steps: TourStep[],
    t: Record<string, string>,
    userId: string,
  ): void {
    const driveSteps: DriveStep[] = steps.map((s) => ({
      element: s.element,
      disableActiveInteraction: !s.interactive,
      popover: {
        title: t[s.titleKey],
        description: t[s.descriptionKey],
        side: s.side,
        align: s.align,
      },
    }));

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const active = {
      instance: null as unknown as ReturnType<typeof driver>,
      shouldMarkSeen: true,
    };

    active.instance = driver({
      steps: driveSteps,
      allowClose: true,
      showProgress: true,
      animate: !reduceMotion,
      smoothScroll: !reduceMotion,
      stagePadding: 6,
      stageRadius: 12,
      popoverOffset: 14,
      overlayColor: '#05080d',
      overlayOpacity: 0.72,
      popoverClass: 'tour-popover',
      nextBtnText: t[COMMON_KEYS.next],
      prevBtnText: t[COMMON_KEYS.previous],
      doneBtnText: t[COMMON_KEYS.done],
      onPopoverRender: this.popoverDecorator(steps, t, reduceMotion),
      overlayClickBehavior: () => { },
      onDestroyed: () => {
        if (this.activeTour === active) this.activeTour = null;

        if (active.shouldMarkSeen && this.authStore.user()?.id === userId) {
          this.markSeen(tourKey, userId);
        }
      },
    });

    this.activeTour = active;
    active.instance.drive();
  }

  private popoverDecorator(
    steps: TourStep[],
    t: Record<string, string>,
    reduceMotion: boolean,
  ): NonNullable<Config['onPopoverRender']> {
    // Persists across steps; the popover is rebuilt each time, this closure isn't.
    let previousIndex: number | null = null;

    return (popover, { state }) => {
      const index = state.activeIndex ?? 0;
      const total = steps.length;
      const step = steps[index];
      const isFirst = previousIndex === null;
      const isForward = isFirst || index >= (previousIndex as number);
      previousIndex = index;

      // Motion context for the CSS: slide direction, first-vs-later, RTL sign.
      const wrapper = popover.wrapper;
      wrapper.setAttribute('data-dir', isForward ? 'forward' : 'back');
      wrapper.setAttribute('data-phase', isFirst ? 'first' : 'next');
      wrapper.style.setProperty(
        '--tour-sign',
        getComputedStyle(document.body).direction === 'rtl' ? '-1' : '1',
      );

      if (step?.icon) {
        const badge = document.createElement('span');
        badge.className = 'tour-badge';
        badge.setAttribute('aria-hidden', 'true');
        badge.setAttribute('data-motion', step.motion ?? 'float');
        badge.innerHTML = step.icon 
        popover.wrapper.prepend(badge);
      }

      popover.closeButton.setAttribute('aria-label', t[COMMON_KEYS.skip]);
      popover.closeButton.title = t[COMMON_KEYS.skip];

      // dot - link - dot - link ... ; the newest link animates its fill.
      const nodes: HTMLElement[] = [];
      for (let i = 0; i < total; i++) {
        if (i > 0) {
          const link = document.createElement('span');
          link.className =
            'tour-link' +
            (i <= index ? ' is-done' : '') +
            (i === index && isForward ? ' is-new' : '');
          nodes.push(link);
        }
        const dot = document.createElement('span');
        dot.className =
          'tour-dot' + (i < index ? ' is-done' : i === index ? ' is-active' : '');
        nodes.push(dot);
      }

      const dots = popover.progress;
      dots.replaceChildren(...nodes);
      dots.style.display = 'flex';
      dots.setAttribute('role', 'img');

      const lang = this.translate.getCurrentLang() ?? 'ar';
      dots.setAttribute(
        'aria-label',
        this.translate.instant(COMMON_KEYS.progress, {
          CURRENT: digitsFor(index + 1, lang),
          TOTAL: digitsFor(total, lang),
        }),
      );

      // Finish moment: capture phase, so we read the button's position
      // before Driver's own click handler tears the popover down.
      if (index === total - 1 && !reduceMotion) {
        popover.nextButton.addEventListener(
          'click',
          () => burst(popover.nextButton.getBoundingClientRect()),
          { capture: true },
        );
      }
    };
  }

  private markSeen(tourKey: TourKey, userId: string): void {
    this._state.update((state) => {
      if (state.userId !== userId) return state;

      const seenTours = new Set(state.seenTours);
      seenTours.add(tourKey);

      return { ...state, seenTours };
    });

    // Persist in the background. Local state remains updated even on failure.
    this.http
      .put(this.endpoint + '/' + encodeURIComponent(tourKey), {})
      .subscribe({
        error: () => { },
      });
  }
}