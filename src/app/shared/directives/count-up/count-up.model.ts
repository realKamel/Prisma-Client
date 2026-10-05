export type CountUpFormatMode = 'number' | 'currency' | 'percent' | 'custom';
export type CountUpAnimationType = 'spring' | 'tween';
export interface CountUpOptions {
  start?: number;
  end: number;
  duration?: number;
  formatMode?: CountUpFormatMode;
  locale?: string;
}
