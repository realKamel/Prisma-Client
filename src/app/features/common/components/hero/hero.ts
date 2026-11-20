import { Component, ElementRef, NgZone, computed, effect, inject, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  bootstrapBellFill,
  bootstrapCheckLg,
  bootstrapPlayFill,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NgmMotionDirective, type Transition } from '@scripttype/ng-motion';
import { ConfigService } from '../../../../core/services/configuration/config';
import {
  blurRevealAnimate,
  blurRevealInitial,
  blurRevealTransition,
} from '../../../../shared/animations/motion.animations';

const STAGE_LABEL = 'ثلاث ميزات تدور حول وصلة';

interface Planet {
  readonly kind: 'lecture' | 'quiz' | 'parent';
  readonly icon: string;
  readonly label: string;
}

/** The three real parts of the product. Each one is a planet; its card opens on hover, focus or tap. */
const PLANETS: readonly Planet[] = [
  { kind: 'lecture', icon: 'bootstrapPlayFill', label: 'محاضرات فيديو' },
  { kind: 'quiz', icon: 'bootstrapCheckLg', label: 'واجبات واختبارات' },
  { kind: 'parent', icon: 'bootstrapBellFill', label: 'متابعة ولي الأمر' },
];

/**
 * The brand name "وصلة" as a constellation, in a coordinate space centered on (0, 0), about 380 wide.
 * Traced from the letterforms (skeleton of the glyphs, simplified to a few stars). Reading right to left:
 * waw, sad, lam, ta marbuta. The last two stars (SOLO) are the two dots of the ta marbuta and have no lines.
 */
const STARS: readonly (readonly [number, number])[] = [
  [-78, -106], [-85, -77], [-71, 28], [-140, -51], [-143, -19], [-169, -4], [-178, 21], [-163, 29],
  [-135, 20], [-8, -10], [-10, 18], [-42, 34], [32, 34], [-115, 34], [180, 33], [175, 1], [151, -2],
  [142, 28], [166, 80], [120, 98], [60, -4], [82, -8], [101, 6], [96, 31], [-134, -74], [-166, -69],
];
const LINES: readonly (readonly [number, number])[] = [
  [0, 1], [1, 2], [2, 11], [2, 13], [3, 4], [4, 5], [4, 8], [5, 6], [6, 7], [7, 8], [8, 13], [9, 10],
  [10, 11], [10, 12], [12, 20], [12, 23], [14, 15], [14, 17], [14, 18], [15, 16], [16, 17], [18, 19],
  [20, 21], [21, 22], [22, 23],
];
const SOLO = new Set([24, 25]);

/** Draw-in order: right to left, the way the word is read. */
const RANK = new Map(
  STARS.map((_, index) => index)
    .sort((a, b) => (STARS[b]?.[0] ?? 0) - (STARS[a]?.[0] ?? 0))
    .map((star, rank) => [star, rank] as const),
);

const CONSTELLATION = {
  stars: STARS.map(([x, y], index) => ({ x, y, r: SOLO.has(index) ? 4.5 : 3.5, i: RANK.get(index) ?? 0 })),
  lines: LINES.map(([a, b]) => {
    const p = STARS[a];
    const q = STARS[b];

    return {
      d: p && q ? `M${p[0]} ${p[1]}L${q[0]} ${q[1]}` : '',
      i: Math.min(RANK.get(a) ?? 0, RANK.get(b) ?? 0),
    };
  }).filter((line) => line.d),
};

/**
 * Orbit geometry, in the 1100x700 coordinate space of the galaxy layers. The rings are tilted ellipses
 * around the center; the tilt here must match rotate(-14) in the template. Each planet is
 * `phase + speed * time * ORBIT_RAD_PER_MS`; roughly a 4 minute lap, kept slow on purpose. The planets sit in a layer
 * below the text columns, so they pass under the headline, subtitle and buttons (the scrim darkens them there).
 */
const STAGE_W = 1100;
const STAGE_H = 700;
const TILT = (-14 * Math.PI) / 180;
const ORBIT_RAD_PER_MS = 0.000022;
const RINGS = [
  { rx: 520, ry: 190 },
  { rx: 360, ry: 130 },
] as const;
const ORBIT_BODIES = [
  { ring: 0, phase: 0.55, speed: 1 },
  { ring: 0, phase: 3.3, speed: 1 },
  { ring: 1, phase: 1.9, speed: -1.3 },
] as const;

/**
 * Moves the planets with GPU transforms (no layout) and sizes the rings. On narrow screens the galaxy is wider
 * than the viewport, so the rings are squeezed to keep every planet on screen. A planet's card opens on hover
 * or focus, and a click or tap pins it. Returns a cleanup function.
 */
function startOrbit(host: HTMLElement): () => void {
  const front = host.querySelector<HTMLElement>('[data-front]');

  if (typeof requestAnimationFrame === 'undefined' || !front) {
    return () => undefined;
  }

  const planets = Array.from(front.querySelectorAll<HTMLElement>('[data-planet]'));
  const dots = planets.map((planet) => planet.querySelector<HTMLElement>('[data-dot]'));
  const rings = Array.from(host.querySelectorAll<SVGEllipseElement>('[data-ring]'));
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cos = Math.cos(TILT);
  const sin = Math.sin(TILT);

  let scale = 1;
  let fit = 1;
  let time = 0;
  let active = -1;
  let pinned = false;
  let lifted = false;

  const radii = (ring: number): { rx: number; ry: number } => {
    const base = RINGS[ring];

    if (!base) {
      return { rx: 0, ry: 0 };
    }

    const rx = base.rx * fit;

    return { rx, ry: Math.min(base.ry, rx * 0.55) };
  };

  const draw = (now: number): void => {
    time = now;

    planets.forEach((planet, index) => {
      const body = ORBIT_BODIES[index];

      if (!body) {
        return;
      }

      const { rx, ry } = radii(body.ring);
      const angle = body.phase + body.speed * now * ORBIT_RAD_PER_MS;
      const depth = Math.sin(angle);
      const ex = rx * Math.cos(angle) * cos - ry * depth * sin;
      const ey = rx * Math.cos(angle) * sin + ry * depth * cos;
      const x = (STAGE_W / 2 + ex) * scale;
      const y = (STAGE_H / 2 + ey) * scale;

      // The card opens toward the middle of the galaxy.
      const dist = Math.hypot(ex, ey) * scale || 1;
      const off = Math.min(110, dist * 0.6);

      planet.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      planet.style.zIndex = index === active ? '30' : '0';
      planet.style.setProperty('--ox', `${((-ex * scale) / dist * off).toFixed(1)}px`);
      planet.style.setProperty('--oy', `${((-ey * scale) / dist * off + 30).toFixed(1)}px`);

      const dot = dots[index];

      if (dot) {
        dot.style.scale = (1 + 0.14 * depth).toFixed(3);
        dot.style.opacity = index === active ? '1' : lifted ? '0' : (0.8 + 0.1 * (depth + 1)).toFixed(3);
      }
    });
  };

  const layout = (): void => {
    scale = front.offsetWidth / STAGE_W;
    fit = Math.min(1, ((document.documentElement.clientWidth / 2 - 30) / scale) / (RINGS[0]?.rx ?? 1));

    rings.forEach((ring, index) => {
      const { rx, ry } = radii(index);

      ring.setAttribute('rx', rx.toFixed(1));
      ring.setAttribute('ry', ry.toFixed(1));
    });

    draw(time);
  };

  // `front` keeps a fixed pixel width from sm up while the viewport still changes, so watch the stage too.
  const observer = new ResizeObserver(layout);
  observer.observe(front);
  observer.observe(host);
  layout();

  // Hover and tap only reach planets that are visible, so they never lift the layer. Keyboard focus can land on a
  // planet that is under the text: only then the layer rises above it, and the other planets hide so they do not pop out.
  const setActive = (index: number, lift = false): void => {
    active = index;
    lifted = lift && index >= 0;
    front.style.zIndex = lifted ? '20' : '';
    planets.forEach((planet, i) => planet.classList.toggle('is-active', i === index));
    draw(time);
  };

  const listeners: (() => void)[] = [];
  const listen = <K extends keyof HTMLElementEventMap>(
    target: HTMLElement,
    type: K,
    handler: (event: HTMLElementEventMap[K]) => void,
  ): void => {
    target.addEventListener(type, handler);
    listeners.push(() => target.removeEventListener(type, handler));
  };

  dots.forEach((dot, index) => {
    if (!dot) {
      return;
    }

    listen(dot, 'pointerenter', (event) => event.pointerType === 'mouse' && setActive(index));
    listen(dot, 'pointerleave', (event) => event.pointerType === 'mouse' && !pinned && setActive(-1));
    listen(dot, 'focus', () => setActive(index, dot.matches(':focus-visible')));
    listen(dot, 'blur', () => !pinned && setActive(-1));
    listen(dot, 'click', () => {
      pinned = !(pinned && active === index);
      setActive(pinned ? index : -1);
    });
  });

  // Tapping anywhere else closes a pinned card.
  const outside = (event: PointerEvent): void => {
    if (active >= 0 && !(event.target as Element | null)?.closest('[data-planet]')) {
      pinned = false;
      setActive(-1);
    }
  };

  document.addEventListener('pointerdown', outside);

  let frame = 0;

  if (!reduceMotion) {
    frame = requestAnimationFrame(function tick(now) {
      draw(now);
      frame = requestAnimationFrame(tick);
    });
  }

  return () => {
    cancelAnimationFrame(frame);
    document.removeEventListener('pointerdown', outside);
    listeners.forEach((remove) => remove());
    observer.disconnect();
  };
}

@Component({
  selector: 'app-hero',
  imports: [RouterLink, NgIcon, NgmMotionDirective],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
  viewProviders: [provideIcons({ bootstrapPlayFill, bootstrapCheckLg, bootstrapBellFill })],
})
export class HeroComponent {
  private readonly configService = inject(ConfigService);
  private readonly zone = inject(NgZone);

  /** The stage only exists once the hero config has loaded, so the loop starts from an effect. */
  private readonly stage = viewChild<ElementRef<HTMLElement>>('stage');

  protected readonly hero = computed(() => this.configService.config()?.hero);
  protected readonly stageLabel = STAGE_LABEL;
  protected readonly planets = PLANETS;
  protected readonly constellation = CONSTELLATION;

  protected readonly blurInitial = blurRevealInitial;
  protected readonly blurAnimate = blurRevealAnimate;

  /** Staggered blur reveal: each block unblurs just after the one before it. */
  protected readonly headlineTransition: Transition = { ...blurRevealTransition, delay: 0.1 };
  protected readonly orbitTransition: Transition = { ...blurRevealTransition, delay: 0.2 };
  protected readonly subtitleTransition: Transition = { ...blurRevealTransition, delay: 0.3 };
  protected readonly ctaTransition: Transition = { ...blurRevealTransition, delay: 0.4 };
  protected readonly microTransition: Transition = { ...blurRevealTransition, delay: 0.5 };

  /**
   * One headline in two lines. The first word (the brand, "وصلة،") sits alone on line 1 in the accent color,
   * and everything after it goes on line 2.
   * Accepts the pre-split API shape (titleLine1 / titleLine2) or the single-string fallback.
   */
  protected readonly headline = computed(() => {
    const hero = this.hero();
    const split = [hero?.titleLine1, hero?.titleLine2]
      .map((line) => line?.trim())
      .filter(Boolean)
      .join(' ');
    const words = (split || hero?.title || '').trim().split(/\s+/).filter(Boolean);
    const [brand = '', ...rest] = words;

    return { brand, rest: rest.join(' ') };
  });

  constructor() {
    effect((onCleanup) => {
      const stage = this.stage()?.nativeElement;

      if (!stage) {
        return;
      }

      onCleanup(this.zone.runOutsideAngular(() => startOrbit(stage)));
    });
  }
}