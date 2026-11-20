import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Params, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideChevronDown,
  lucideClipboardCheck,
  lucideFileText,
  lucideFlame,
  lucideTrophy,
  lucideRotateCcw
} from '@ng-icons/lucide';
import { TranslatePipe } from '@ngx-translate/core';
import { catchError, of } from 'rxjs';
import { StreakDto, StreakTask, StudentDto } from '../../../../models/dashboard.models';
import { DashboardService } from '../../services/dashboard.service';

interface StreakDay {
  code: string;
  cls: string;
  isToday: boolean;
}

const DAY_CODES = ['SAT', 'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI'] as const;
const MILESTONES: readonly number[] = [3, 7, 14, 30, 60, 100, 200, 365];

@Component({
  selector: 'app-hero-greet',
  templateUrl: './hero-greet.html',
  imports: [NgIcon, TranslatePipe, RouterLink],
  viewProviders: [
    provideIcons({
      lucideFlame,
      lucideTrophy,
      lucideChevronDown,
      lucideClipboardCheck,
      lucideFileText,
      lucideRotateCcw
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroGreet {
  readonly student = input.required<StudentDto>();
  readonly streak = input.required<StreakDto>();

  private readonly dashboardService = inject(DashboardService);

  // ── Tasks panel ──────────────────────────────────────────────
  protected readonly info = toSignal(
    this.dashboardService.getStreakTasks().pipe(catchError(() => of(null))),
    { initialValue: null },
  );
  protected readonly doneToday = computed(() => this.info()?.doneToday ?? true);

  protected readonly needsAction = computed(() => {
    const i = this.info();
    return !!i && !i.doneToday && i.tasks.length > 0;
  });

  protected readonly open = signal(false);
  private lastPointer = 'mouse';

  protected onPointerDown(e: PointerEvent): void {
    this.lastPointer = e.pointerType;
  }
  protected onHover(e: PointerEvent, inside: boolean): void {
    if (e.pointerType === 'mouse') this.open.set(inside);
  }
  protected toggle(): void {
    this.open.update((v) => !v);
  }
  protected onTap(): void {
    if (this.lastPointer !== 'mouse') this.toggle();
  }

  protected routeOf(t: StreakTask): (string | number)[] {
    switch (t.type) {
      case 'quiz':
        return ['/quizzes', t.id];
      case 'lessonQuiz':
      case 'assignment':
        return ['/lessons', t.guidId, 'watch'];
      case 'practice':
        return ['/practice'];
    }
  }

  /** Lets the lesson player jump straight to its quiz tab. */
  protected queryOf(t: StreakTask): Params | null {
    if(t.type === 'lessonQuiz')
      return { tab: 'quiz' };
    else if(t.type === 'assignment')
      return { tab: 'assignment' };
    else return null
  }

  private readonly icons = {
    quiz: 'lucideClipboardCheck',
    lessonQuiz: 'lucideClipboardCheck',
    assignment: 'lucideFileText',
    practice: 'lucideRotateCcw',
  } as const;

  protected iconOf(t: StreakTask): string {
    return this.icons[t.type];
  }
  // ── Count-up ─────────────────────────────────────────────────
  protected readonly displayCount = signal(0);

  private readonly reducedMotion =
    typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  constructor() {
    effect((onCleanup) => {
      const target = this.streak().count;
      const from = untracked(() => this.displayCount());

      if (this.reducedMotion || from === target) {
        this.displayCount.set(target);
        return;
      }

      const duration = Math.min(1400, 400 + Math.abs(target - from) * 60);
      const t0 = performance.now();
      let raf = 0;

      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        this.displayCount.set(Math.round(from + (target - from) * eased));
        if (p < 1) raf = requestAnimationFrame(tick);
      };

      raf = requestAnimationFrame(tick);
      onCleanup(() => cancelAnimationFrame(raf));
    });
  }

  // ── Display ──────────────────────────────────────────────────
  protected readonly theme = computed(() => {
    const c = this.streak().count;
    if (c === 0) return { flame: 'text-muted', glow: '142 160 181', embers: 0 };
    if (c >= 30) return { flame: 'text-coral', glow: '255 107 87', embers: 8 };
    if (c >= 14) return { flame: 'text-coral', glow: '255 140 80', embers: 6 };
    if (c >= 7) return { flame: 'text-star', glow: '255 170 60', embers: 4 };
    return { flame: 'text-star', glow: '247 201 72', embers: 2 };
  });

  protected readonly embers = computed(() =>
    Array.from({ length: this.theme().embers }, (_, i) => ({
      left: 30 + ((i * 37) % 40),
      x: ((i * 53) % 25) - 12,
      delay: i * 0.45,
      duration: 2 + (i % 3) * 0.5,
    })),
  );

  protected readonly dayKey = computed(() => {
    const c = this.streak().count;
    return c === 1 ? 'ONE' : c <= 10 ? 'FEW' : 'MANY';
  });

  protected readonly isMilestone = computed(() => MILESTONES.includes(this.streak().count));

  protected readonly milestone = computed(() => {
    const c = this.streak().count;
    const next = MILESTONES.find((m) => m > c);
    if (!next) return null;
    const prev = [...MILESTONES].reverse().find((m) => m <= c) ?? 0;
    return { prev, next, left: next - c };
  });

  protected readonly progress = computed(() => {
    const m = this.milestone();
    if (!m) return 100;
    const pct = ((this.displayCount() - m.prev) / (m.next - m.prev)) * 100;
    return Math.max(0, Math.min(100, pct));
  });

  protected readonly ringCirc = 2 * Math.PI * 24; // r = 24 in the SVG
  protected readonly ringOffset = computed(() => this.ringCirc * (1 - this.progress() / 100));

  protected readonly weekDays = computed<StreakDay[]>(() => {
    const count = this.streak().count;
    const wd = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'Africa/Cairo' }).format(new Date());
    const todayIndex = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'].indexOf(wd);
    const offset = this.doneToday() ? 0 : 1;

    return DAY_CODES.map((code, i) => {
      const isToday = i === todayIndex;
      const daysAgo = todayIndex - i;
      const done = daysAgo >= offset && daysAgo < count + offset;

      const cls = isToday
        ? 'bg-primary-light outline-primary outline-2 outline-offset-2'
        : done
          ? 'bg-star shadow-[0_0_8px_rgba(247,201,72,0.5)]'
          : 'bg-[rgba(var(--color-primary-rgb),0.18)]';

      return { code, cls, isToday };
    });
  });
}