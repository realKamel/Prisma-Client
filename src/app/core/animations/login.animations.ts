import { cardLiftHover, layoutTransition, quickTransition } from './motion.animations';

export const loginCardInitial = { opacity: 0, y: 28, scale: 0.96, rotateX: -6 };

export const loginCardEntrance = { opacity: 1, y: 0, scale: 1, rotateX: 0 };

export { cardLiftHover as loginCardHover, layoutTransition as loginLayoutTransition, quickTransition as loginSwitchTransition };

export const loginCardEntranceTransition = {
  type: 'spring',
  stiffness: 240,
  damping: 22,
  mass: 0.8,
} as const;

