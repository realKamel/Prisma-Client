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

/**
 * Reveal timing for the sidebar captions while the desktop rail collapses or
 * expands: the text is clipped (never wrapped) by the shrinking rail, so a
 * spring keeps the fade in step with the CSS width transition.
 */
export const sidebarLabelTransition = {
  type: 'spring',
  stiffness: 320,
  damping: 30,
} as const;

/** Delay before the first nested sub-menu item starts its entrance. */
export const sidebarSubItemStaggerBase = 0.05;

/** Per-item increment added on top of the base delay for nested sub-menu items. */
export const sidebarSubItemStaggerStep = 0.045;
