export const pageEntranceInitial = { opacity: 0, y: 18 } as const;

export const pageEntranceAnimate = { opacity: 1, y: 0 } as const;

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
  ease: 'easeOut',
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
