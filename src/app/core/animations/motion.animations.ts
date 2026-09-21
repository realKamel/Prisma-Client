import type { Transition, Variants } from '@scripttype/ng-motion';

export const pageEntranceInitial = { opacity: 0, y: 18 } as const;

export const pageEntranceAnimate = { opacity: 1, y: 0 } as const;

export const heroEntranceInitial = { opacity: 0, y: 32 } as const;

export const heroEntranceTransition = {
  type: 'spring',
  stiffness: 280,
  damping: 26,
} as const;

export const ambientLoopTransition = {
  duration: 8,
  ease: 'easeInOut',
  repeat: Infinity,
} as const;

export const pulseLoopTransition = {
  duration: 2,
  ease: 'easeInOut',
  repeat: Infinity,
} as const;

export const infiniteRepeat = Infinity;

export const contentEntranceInitial = { opacity: 0, y: 24 } as const;

export const contentEntranceAnimate = { opacity: 1, y: 0 } as const;

export const contentEntranceTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 28,
} as const;

export const fadeInitial = { opacity: 0 } as const;

export const fadeAnimate = { opacity: 1 } as const;

export const scaleEntranceInitial = { opacity: 0, scale: 0.92 } as const;

export const scaleEntranceAnimate = { opacity: 1, scale: 1 } as const;

export const invalidFieldShake = {
  x: [0, -8, 8, -6, 6, -3, 3, 0],
};

export const invalidFieldRest = { x: 0 } as const;

export const invalidFieldTransition = {
  type: 'tween',
  duration: 0.42,
  ease: 'easeOut',
} as const;

export const pageEntranceTransition = {
  type: 'spring',
  stiffness: 280,
  damping: 26,
} as const;

export const cardEntranceTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 28,
} as const;

export const stateSwapTransition = {
  type: 'spring',
  stiffness: 280,
  damping: 24,
} as const;

export const cardLiftHover = { y: -3, scale: 1.005 };

export const layoutTransition = {
  type: 'tween',
  duration: 0.18,
  ease: 'easeOut',
} as const;

export const quickTransition = {
  type: 'tween',
  duration: 0.14,
  ease: 'easeOut',
} as const;

export const navbarEntranceTransition = {
  type: 'tween',
  duration: 0.18,
} as const;

export const navbarSidebarTransition = {
  type: 'spring',
  stiffness: 380,
  damping: 38,
  mass: 0.95,
} as const;

export const navbarOverlayTransition = {
  duration: 0.28,
  ease: 'easeInOut',
} as const;

export const navbarIconTransition = {
  duration: 0.22,
  ease: 'easeInOut',
} as const;

export const sidebarActionVariants: Variants = {
  hover: {},
};

export const sidebarActionIconVariants: Variants = {
  hover: {
    x: 4,
    transition: { type: 'spring', stiffness: 480, damping: 30 },
  },
};

/*
   ## SCROLL REVEAL
   Paired enter/exit states for viewport-driven sections. `[whileInView]` alone
   cannot animate OUT of the viewport (ng-motion snaps to the base target on
   leave), so `sectionRevealExit` is used as BOTH the `initial` state and the
   value the `animate` input falls back to while the element is out of view.
    */
export const sectionRevealEnter = { opacity: 1, y: 0 } as const;

export const sectionRevealExit = { opacity: 0, y: 32 } as const;

export const sectionRevealTransition: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 30,
  mass: 0.9,
};

/*
   ## BLUR REVEAL
   Headline / copy reveal: unblurs, lifts and fades in one pass.
    */
export const blurRevealInitial = { opacity: 0, y: 14, filter: 'blur(10px)' } as const;

export const blurRevealAnimate = { opacity: 1, y: 0, filter: 'blur(0px)' } as const;

export const blurRevealTransition: Transition = {
  duration: 0.7,
  ease: [0.16, 1, 0.3, 1],
};

/*
   ## PREVIEW CARD REVEAL
   Floating hero cards: they settle in while they are on screen and retract back
   out (fade + drift towards the hero centre) as soon as they are mostly scrolled
   past, in both scroll directions.
    */
export const cardRevealTransition: Transition = {
  duration: 0.5,
  ease: [0.16, 1, 0.3, 1],
};
