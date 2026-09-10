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
