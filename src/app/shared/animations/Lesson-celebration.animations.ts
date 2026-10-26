import type { TargetAndTransition, Transition } from '@scripttype/ng-motion';

/**
 * Celebration presets for the lesson player. Same shape as the presets you already
 * bind on the tabs ([initial] / [animate] / [transition] on an `ngmMotion` element).
 * Kept in their own file so they don't touch motion.animations.ts — move them there
 * if you'd rather have one file.
 *
 * NOTE: the Tailwind classes below (bg-mint, bg-star, ...) live in a .ts file. Tailwind
 * must be scanning it or the colors won't be generated (v4 scans everything by default).
 */

export interface MotionPreset {
  initial: TargetAndTransition;
  animate: TargetAndTransition;
  transition: Transition;
}

export interface Particle extends MotionPreset {
  classes: string;
  /** Horizontal start position in % (confetti only). */
  left?: number;
}

/** Respect the OS "reduce motion" setting: skip particles, keep it calm. */
export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

/** Section badge check mark: spins in with a springy overshoot. */
const badgePop: MotionPreset = {
  initial: { scale: 0.2, rotate: -90, opacity: 0 },
  animate: { scale: 1, rotate: 0, opacity: 1 },
  transition: { type: 'spring', stiffness: 420, damping: 14 },
};

/** "Lesson finished" card: floats up and settles. */
const card: MotionPreset = {
  initial: { opacity: 0, y: 24, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { type: 'spring', stiffness: 260, damping: 22 },
};

/** Trophy: low damping so it bounces past 1 and wobbles into place. */
const trophy: MotionPreset = {
  initial: { scale: 0, rotate: -25 },
  animate: { scale: 1, rotate: 0 },
  transition: { type: 'spring', stiffness: 300, damping: 9, delay: 0.15 },
};

/** Eight little dots that burst outward from a section badge. */
const SPARKLE_RADIUS = 20;
const sparkles: Particle[] = Array.from({ length: 8 }, (_, i) => {
  const angle = (i * Math.PI) / 4;
  return {
    classes: i % 2 === 0 ? 'bg-mint' : 'bg-star',
    initial: { x: 0, y: 0, scale: 0, opacity: 1 },
    animate: {
      x: Math.round(Math.cos(angle) * SPARKLE_RADIUS * 100) / 100,
      y: Math.round(Math.sin(angle) * SPARKLE_RADIUS * 100) / 100,
      scale: 1,
      opacity: 0,
    },
    transition: { duration: 0.65, delay: 0.05, ease: 'easeOut' },
  };
});

/** Confetti that rains down inside the finished-lesson card. Deterministic (no Math.random)
 *  so it looks the same on every render. */
const CONFETTI_COLORS = ['bg-mint', 'bg-star', 'bg-coral', 'bg-primary-light'];
const confetti: Particle[] = Array.from({ length: 18 }, (_, i) => {
  const direction = i % 2 === 0 ? 1 : -1;
  return {
    left: ((i * 37) % 96) + 2,
    classes: `${CONFETTI_COLORS[i % CONFETTI_COLORS.length]} ${i % 3 === 0 ? 'h-2.5 w-1.5' : 'h-2 w-2'}`,
    initial: { y: -12, x: 0, rotate: 0, opacity: 1 },
    animate: {
      y: 190,
      x: direction * (10 + (i % 5) * 7),
      rotate: direction * (180 + (i % 3) * 120),
      opacity: 0,
    },
    transition: { duration: 1.4 + (i % 4) * 0.25, delay: (i % 6) * 0.1, ease: 'easeIn' },
  };
});

export const lessonCelebration = { badgePop, card, trophy, sparkles, confetti };