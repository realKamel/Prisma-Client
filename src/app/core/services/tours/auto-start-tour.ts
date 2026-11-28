import { DestroyRef, Injector, afterNextRender, effect, inject, untracked } from '@angular/core';
import { AuthStore } from '../../stores/auth.store';
import { TourKey, TourStep } from '../../models/tour.model';
import { TourService } from './tour.service';

/** Longest card entrance (0.32s delay + spring settle) with margin. */
const ENTRANCE_SETTLE_MS = 900;

/** Starts a student tour once per user when `ready()` turns true. Call from a constructor. */
export function autoStartTour(options: {
  key: TourKey;
  steps: () => TourStep[];
  ready: () => boolean;
  onReady?: () => void;
  onSkip?: () => void;
}): void {
  const tours = inject(TourService);
  const auth = inject(AuthStore);
  const injector = inject(Injector);

  let startedFor: string | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;

  inject(DestroyRef).onDestroy(() => {
    if (timer) clearTimeout(timer);
    tours.destroy(false);
  });

  effect(() => {
    const user = auth.user();
    const state = tours.state();

    untracked(() => options.onReady?.());
    if (startedFor !== (user?.id ?? null)) startedFor = null;
    if (
      !user ||
      !options.ready() ||
      state.userId !== user.id ||
      state.status !== 'ready' ||
      state.seenTours.has(options.key) ||
      startedFor === user.id
    ) {
      return;
    }

    startedFor = user.id;

    afterNextRender(
      () => {
        timer = setTimeout(() => {
          timer = null;
          if (auth.user()?.id !== user.id) return;
          if (!tours.start(options.key, options.steps())) options.onSkip?.();
        }, ENTRANCE_SETTLE_MS);
      },
      { injector },
    );
  });
}