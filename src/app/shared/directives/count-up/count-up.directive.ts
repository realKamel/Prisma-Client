import { Directive, ElementRef, LOCALE_ID, effect, inject, input } from '@angular/core';
import { animate, motionValue } from '@scripttype/ng-motion';

export type CountUpFormatMode = 'number' | 'currency' | 'percent' | 'custom';
export type CountUpAnimationType = 'spring' | 'tween';

@Directive({
  selector: '[appCountUp]',
  standalone: true,
  host: {
    '[style.font-variant-numeric]': '"tabular-nums"',
  },
})
export class CountUpDirective {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly defaultLocale = inject(LOCALE_ID);

  // --- Core Inputs ---
  public readonly target = input.required<number>({ alias: 'appCountUp' });
  public readonly start = input<number>(0);
  public readonly animationType = input<CountUpAnimationType>('tween');

  // --- Spring Physics Options ---
  public readonly stiffness = input<number>(100);
  public readonly damping = input<number>(15);
  public readonly mass = input<number>(1);

  // --- Tween Options ---
  public readonly duration = input<number>(2);

  // --- Formatting Options ---
  public readonly mode = input<CountUpFormatMode>('number');
  public readonly currency = input<string>('EGP');
  public readonly display = input<string | boolean>('symbol');

  /**
   * Percent mode only. When `false` (default) the target is treated as a
   * percentage out of 100 (e.g. `75` renders as `75%`). Set to `true` when the
   * target is already a fraction between 0 and 1 (e.g. `0.75` renders as `75%`).
   */
  public readonly percentAsFraction = input<boolean>(false);

  /**
   * Digits format in Angular notation: '{minInteger}.{minFraction}-{maxFraction}'
   * Defaults to '1.0-0' for number mode and '1.2-2' for currency mode.
   */
  public readonly digitsInfo = input<string | undefined>(undefined);

  /** Explicitly round intermediate frames to whole integers */
  public readonly round = input<boolean>(false);

  public readonly locale = input<string>(this.defaultLocale);
  public readonly customFormatter = input<((value: number) => string) | undefined>(undefined);

  private readonly count = motionValue(0);

  constructor() {
    effect((onCleanup) => {
      const targetVal = this.target();
      const startVal = this.start();
      const animType = this.animationType();
      const modeVal = this.mode();
      const currCode = this.currency();
      const dispVal = this.display();
      const locVal = this.locale();
      const formatter = this.customFormatter();
      const shouldRound = this.round();

      // Resolve digitsInfo default
      const defaultDigits = modeVal === 'currency' ? '1.2-2' : '1.0-0';
      const digits = this.digitsInfo() ?? defaultDigits;

      const { minFractionDigits, maxFractionDigits } = parseDigitsInfo(digits);

      const numberFormatter = createIntlFormatter({
        mode: modeVal,
        locale: locVal,
        currency: currCode,
        display: dispVal,
        minFractionDigits,
        maxFractionDigits,
      });

      // Intl percent formatting expects a fraction (0.5 -> 50%), so scale
      // `0-100` inputs down unless the consumer opted into fraction values.
      const scale = modeVal === 'percent' && !this.percentAsFraction() ? 100 : 1;

      const renderFrame = (val: number) => {
        const isIntegerOnly = minFractionDigits === 0 && maxFractionDigits === 0;
        const currentVal = shouldRound || isIntegerOnly ? Math.round(val) : val;
        const scaledVal = currentVal / scale;

        const text = formatter ? formatter(scaledVal) : numberFormatter.format(scaledVal);

        this.el.nativeElement.textContent = text;
      };

      this.count.set(startVal);
      renderFrame(startVal);

      const unsubscribe = this.count.on('change', renderFrame);

      const config =
        animType === 'spring'
          ? {
              type: 'spring' as const,
              stiffness: this.stiffness(),
              damping: this.damping(),
              mass: this.mass(),
            }
          : {
              type: 'tween' as const,
              duration: this.duration(),
              ease: 'easeInOut' as const,
            };

      const animation = animate(this.count, targetVal, config);

      onCleanup(() => {
        animation.stop();
        unsubscribe();
      });
    });
  }
}

function createIntlFormatter(opts: {
  mode: CountUpFormatMode;
  locale: string;
  currency: string;
  display: string | boolean;
  minFractionDigits: number;
  maxFractionDigits: number;
}): Intl.NumberFormat {
  if (opts.mode === 'currency') {
    let currencyDisplay: 'symbol' | 'narrowSymbol' | 'code' | 'name' = 'symbol';

    if (opts.display === 'symbol-narrow') {
      currencyDisplay = 'narrowSymbol';
    } else if (opts.display === 'code') {
      currencyDisplay = 'code';
    }

    return new Intl.NumberFormat(opts.locale, {
      style: 'currency',
      currency: opts.currency,
      currencyDisplay,
      minimumFractionDigits: opts.minFractionDigits,
      maximumFractionDigits: opts.maxFractionDigits,
    });
  }

  if (opts.mode === 'percent') {
    return new Intl.NumberFormat(opts.locale, {
      style: 'percent',
      minimumFractionDigits: opts.minFractionDigits,
      maximumFractionDigits: opts.maxFractionDigits,
    });
  }

  return new Intl.NumberFormat(opts.locale, {
    style: 'decimal',
    minimumFractionDigits: opts.minFractionDigits,
    maximumFractionDigits: opts.maxFractionDigits,
  });
}

function parseDigitsInfo(digitsInfo: string): {
  minFractionDigits: number;
  maxFractionDigits: number;
} {
  const [beforeDash, maxStr] = digitsInfo.split('-');
  const minStr = beforeDash?.split('.')[1];

  let minFractionDigits = minStr ? parseInt(minStr, 10) : 0;
  let maxFractionDigits = maxStr ? parseInt(maxStr, 10) : minFractionDigits;

  if (isNaN(minFractionDigits)) minFractionDigits = 0;
  if (isNaN(maxFractionDigits)) maxFractionDigits = minFractionDigits;

  if (minFractionDigits > maxFractionDigits) {
    maxFractionDigits = minFractionDigits;
  }

  minFractionDigits = Math.min(Math.max(minFractionDigits, 0), 100);
  maxFractionDigits = Math.min(Math.max(maxFractionDigits, 0), 100);

  return { minFractionDigits, maxFractionDigits };
}
