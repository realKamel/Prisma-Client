export const fadeTransition = {
  duration: 0.22,
  ease: 'easeOut',
} as const;

export const popEntranceInitial = { opacity: 0, scale: 0.96, y: -8 } as const;

export const popEntranceAnimate = { opacity: 1, scale: 1, y: 0 } as const;

export const popEntranceTransition = {
  type: 'spring',
  stiffness: 320,
  damping: 26,
} as const;

export const buttonTapTransition = {
  type: 'spring',
  stiffness: 500,
  damping: 28,
} as const;

export const sidebarItemTransition = {
  type: 'spring',
  stiffness: 320,
  damping: 28,
} as const;

export const sidebarItemTap = {
  scale: 0.99,
  transition: buttonTapTransition,
} as const;
