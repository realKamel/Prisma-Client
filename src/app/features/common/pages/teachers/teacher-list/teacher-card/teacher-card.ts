import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  bootstrapArrowLeft,
  bootstrapBookFill,
  bootstrapLightbulbFill,
  bootstrapMortarboardFill,
  bootstrapPersonVideo3,
  bootstrapStarFill,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Teacher } from '../../../../../student/models/teacher.model';
import { StudentCurrentYear } from '../../../../../teacher/services/teacher-catalog.service';

/**
 * How the picture area renders (the designed background is always drawn behind it):
 * - photo:  full-bleed image over the designed background
 * - cutout: transparent PNG that pokes out above the card
 * - none:   monogram badge with orbiting icons over the designed background
 */
type CardMode = 'photo' | 'cutout' | 'none';

/** TODO: add `imageKind?: 'photo' | 'cutout' | null` to the Teacher model, then drop this intersection. */
// type TeacherWithImageKind = Teacher & { imageKind?: 'photo' | 'cutout' | null };

/** Years named on the card before collapsing into "و٤ أخرى". */
const MAX_SHOWN_YEARS = 2;

/** Length of the lessons-number count-up. */
const COUNT_UP_MS = 900;

const hash = (value: string): number => {
  let h = 0;
  for (const ch of value) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
};

/** Small seeded random generator (mulberry32): same teacher id, same design, every time. */
const seeded = (seed: number): (() => number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const between = (rnd: () => number, min: number, max: number): number => min + rnd() * (max - min);
const round1 = (n: number): number => Math.round(n * 10) / 10;
const clamp = (n: number, min: number, max: number): number => Math.min(max, Math.max(min, n));

interface Accent {
  kind: 'plus' | 'ring' | 'dot';
  x: number;
  y: number;
  s: number;
  alpha: number;
  /** Path data, only used by the "plus" kind. */
  d: string;
}

/** Everything the placeholder background needs, in a 0–100 square. */
interface CardArt {
  flip: boolean;
  corner: string;
  dots: { x: number; y: number; w: number; h: number };
  cx: number;
  cy: number;
  r: number;
  ring1: number;
  ring2: number;
  dash: string;
  accents: Accent[];
  chips: { x: number; y: number; icon: string }[];
}

/**
 * Dumb / presentational teacher card.
 * Receives a `Teacher` via input; emits `viewProfile` (whole card) and `viewLessons`.
 * Holds no state and knows nothing about the API or routing.
 */
@Component({
  selector: 'app-teacher-card',
  imports: [NgIcon, TranslatePipe],
  viewProviders: [
    provideIcons({
      bootstrapArrowLeft,
      bootstrapBookFill,
      bootstrapLightbulbFill,
      bootstrapMortarboardFill,
      bootstrapPersonVideo3,
      bootstrapStarFill,
    }),
  ],
  templateUrl: './teacher-card.html',
  styleUrls: ['./teacher-card.css'],
})
export class TeacherCardComponent {
  public readonly teacher = input.required<Teacher>();
  public readonly isLoggedIn = input<boolean>(false);
  public readonly studentCurrentYear = input<StudentCurrentYear>(null);

  public readonly viewProfile = output<Teacher>();
  public readonly viewLessons = output<Teacher>();

  /** Stable per-teacher number, used to vary the background slightly from card to card. */
  private readonly seed = computed(() => hash(String(this.teacher().id)));

  protected readonly fullName = computed(
    () => `${this.teacher().firstName} ${this.teacher().secondName}`,
  );

  /** First letter of the first and second name, spaced so Arabic letters don't join into one word. */
  protected readonly initials = computed(() =>
    [this.teacher().firstName, this.teacher().secondName]
      .map((n) => n?.trim()?.[0] ?? '')
      .join(' '),
  );

  protected readonly mode = computed<CardMode>(() => {
    // const t = this.teacher() as TeacherWithImageKind;
    // if (!t.imageUrl) return 'none';
    // Safe default: anything not explicitly flagged as a cutout renders as a full photo.
    // return t.imageKind === 'cutout' ? 'cutout' : 'photo';
    if(!this.teacher().imageUrl) return 'none';
    return 'photo';
  });

  /**
   * Seeded background design: every teacher gets their own version, but always the same one.
   * Varies the disc height and size, the ring spacing, which big corner shape is used
   * (triangle, quarter disc, diagonal band or half disc), the dot grid, and a handful of
   * small scattered accents. Everything is mirrored for about half of the teachers.
   */
  protected readonly art = computed<CardArt>(() => {
    const rnd = seeded(this.seed());
    const flip = rnd() < 0.5;

    // Spotlight disc + orbit rings
    const cx = 50; // always centred on the card, like the photos
    const cy = round1(between(rnd, 39, 45));
    const r = round1(between(rnd, 30, 36));
    const ring1 = round1(r + between(rnd, 10, 14));
    const ring2 = round1(ring1 + between(rnd, 11, 15));
    const dash = ['1.5 3', '0.6 2.4', '3 3'][Math.floor(rnd() * 3)];

    // Big corner shape (drawn in the top-left, mirrored when `flip`)
    const variant = Math.floor(rnd() * 4);
    let corner: string;
    if (variant === 0) {
      corner = `M0 0H${round1(between(rnd, 38, 52))}L0 ${round1(between(rnd, 34, 48))}Z`;
    } else if (variant === 1) {
      const q = round1(between(rnd, 34, 46));
      corner = `M0 0H${q}A${q} ${q} 0 0 1 0 ${q}Z`;
    } else if (variant === 2) {
      const a = round1(between(rnd, 20, 30));
      const b = round1(between(rnd, 11, 15));
      corner = `M0 ${a}L${a} 0H${round1(a + b)}L0 ${round1(a + b)}Z`;
    } else {
      const x = round1(between(rnd, 18, 30));
      const hr = round1(between(rnd, 14, 20));
      corner = `M${round1(x - hr)} 0A${hr} ${hr} 0 0 0 ${round1(x + hr)} 0Z`;
    }

    // Dot grid in the opposite top corner
    const cols = 3 + Math.floor(rnd() * 3);
    const rows = 2 + Math.floor(rnd() * 3);
    const dots = { x: 100 - 6 - cols * 7, y: round1(between(rnd, 5, 10)), w: cols * 7, h: rows * 7 };

    // Icon chips sitting on the first ring
    const chipSpecs = [
      { icon: 'bootstrapMortarboardFill', angle: -30 + between(rnd, -5, 5) },
      { icon: 'bootstrapBookFill', angle: 190 + between(rnd, -10, 10) },
      { icon: 'bootstrapLightbulbFill', angle: 30 + between(rnd, -8, 8) },
    ];
    const chips = chipSpecs.map((c) => {
      const rad = ((flip ? 180 - c.angle : c.angle) * Math.PI) / 180;
      return {
        icon: c.icon,
        x: round1(clamp(cx + ring1 * Math.cos(rad), 9, 91)),
        y: round1(clamp(cy + ring1 * Math.sin(rad), 20, 62)),
      };
    });

    // Scattered accents, kept off the disc, the corner shape, the dot grid and the chips
    const accents: Accent[] = [];
    for (let tries = 0; tries < 40 && accents.length < 5; tries++) {
      const x = round1(between(rnd, 6, 94));
      const y = round1(between(rnd, 6, 62));
      const ux = flip ? 100 - x : x;
      if (Math.hypot(x - cx, y - cy) < r + 5) continue;
      if (ux <= 56 && y <= 52) continue;
      if (ux >= dots.x - 3 && y <= dots.y + dots.h + 3) continue;
      if (chips.some((c) => Math.hypot(x - c.x, y - c.y) < 13)) continue;
      if (accents.some((a) => Math.hypot(x - a.x, y - a.y) < 14)) continue;

      const roll = rnd();
      const kind: Accent['kind'] = roll < 0.4 ? 'plus' : roll < 0.7 ? 'ring' : 'dot';
      const s = round1(between(rnd, 1.4, 2.6));
      const alpha = Math.round(between(rnd, 0.35, 0.6) * 100) / 100;
      const d =
        kind === 'plus'
          ? `M${round1(x - s)} ${y}H${round1(x + s)}M${x} ${round1(y - s)}V${round1(y + s)}`
          : '';
      accents.push({ kind, x, y, s, alpha, d });
    }

    return { flip, corner, dots, cx, cy, r, ring1, ring2, dash, accents, chips };
  });

  // --- Academic years -------------------------------------------------------

  private readonly years = computed(() => this.teacher().academicYears ?? []);

  /** The API sends the student's year and each teacher's years as `{ id, name }`, so ids match directly. */
  private readonly currentYearId = computed(() => this.studentCurrentYear()?.id ?? null);

  protected readonly teachesMyYear = computed(() => {
    const id = this.currentYearId();
    return !!id && this.years().some((y) => y.id === id);
  });

  protected readonly yearsCount = computed(() => this.years().length);

  /** The student's own year (if taught) is listed first so it is never hidden behind "+N". */
  protected readonly shownYears = computed(() => {
    const id = this.currentYearId();
    return this.years()
      .map((y) => ({ id: y.id, name: y.name, isMine: !!id && y.id === id }))
      .sort((a, b) => Number(b.isMine) - Number(a.isMine))
      .slice(0, MAX_SHOWN_YEARS);
  });

  protected readonly extraYears = computed(() => Math.max(0, this.yearsCount() - MAX_SHOWN_YEARS));

  // --- Lessons --------------------------------------------------------------

  /** While the count-up runs this holds the in-between number; null means "show the real count". */
  private readonly countingLessons = signal<number | null>(null);

  protected readonly lessonsCountLabel = computed(() =>
    String(this.countingLessons() ?? this.teacher().lessonsCount ?? 0).padStart(2, '0'),
  );

  protected readonly lessonsUnit = computed(() =>
    this.teacher().lessonsCount === 1 ? 'درس' : 'دروس',
  );

  // --- Count-up -------------------------------------------------------------

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => this.setupCountUp());
  }

  /**
   * Counts the lessons number up from 0 the first time the card scrolls into view.
   * Skipped (the real number just shows) for reduced-motion users and for 0 lessons.
   */
  private setupCountUp(): void {
    const target = this.teacher().lessonsCount ?? 0;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (target <= 0 || reduceMotion || typeof IntersectionObserver === 'undefined') return;

    this.countingLessons.set(0);
    let frame = 0;

    const run = (): void => {
      const start = performance.now();
      const step = (now: number): void => {
        const t = Math.min(1, (now - start) / COUNT_UP_MS);
        const eased = 1 - Math.pow(1 - t, 3); // ease-out
        if (t < 1) {
          this.countingLessons.set(Math.round(target * eased));
          frame = requestAnimationFrame(step);
        } else {
          this.countingLessons.set(null);
        }
      };
      frame = requestAnimationFrame(step);
    };

    // The host element is inline, so watch the card itself.
    const el = this.host.nativeElement.querySelector('article') ?? this.host.nativeElement;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        observer.disconnect();
        run();
      },
      { threshold: 0.4 },
    );
    observer.observe(el);

    this.destroyRef.onDestroy(() => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    });
  }

  // --- Events ---------------------------------------------------------------

  protected onViewProfile(): void {
    this.viewProfile.emit(this.teacher());
  }

  protected onViewLessons(): void {
    this.viewLessons.emit(this.teacher());
  }
}