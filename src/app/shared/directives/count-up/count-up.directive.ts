import { Directive, ElementRef, LOCALE_ID, effect, inject, input } from '@angular/core';
import { animate, motionValue } from '@scripttype/ng-motion';

export type CountUpFormatMode = 'number' | 'currency' | 'custom';
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
  public readonly digitsInfo = input<string>('1.2-2');
  public readonly locale = input<string>(this.defaultLocale);
  public readonly customFormatter = input<((value: number) => string) | undefined>(undefined);

  private readonly count = motionValue(0);

  constructor() {
    effect((onCleanup) => {
      // 1. Read input signals to establish reactive tracking
      const targetVal = this.target();
      const startVal = this.start();
      const animType = this.animationType();
      const modeVal = this.mode();
      const currCode = this.currency();
      const dispVal = this.display();
      const digits = this.digitsInfo();
      const locVal = this.locale();
      const formatter = this.customFormatter();

      // 2. Parse digitsInfo ('1.2-2' -> minDigits: 2, maxDigits: 2)
      const { minFractionDigits, maxFractionDigits } = parseDigitsInfo(digits);

      // 3. Native Intl.NumberFormat resolution (zero Angular Pipe overhead)
      const numberFormatter = createIntlFormatter({
        mode: modeVal,
        locale: locVal,
        currency: currCode,
        display: dispVal,
        minFractionDigits,
        maxFractionDigits,
      });

      // 4. Frame Renderer
      const renderFrame = (val: number) => {
        const text = formatter ? formatter(val) : numberFormatter.format(val);
        this.el.nativeElement.textContent = text;
      };

      // 5. Initialize Motion Value & Subscribe
      this.count.set(startVal);
      renderFrame(startVal);

      const unsubscribe = this.count.on('change', renderFrame);

      // 6. Transition Configuration
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

      // 7. Start RAF Animation
      const animation = animate(this.count, targetVal, config);

      // 8. Cleanup
      onCleanup(() => {
        animation.stop();
        unsubscribe();
      });
    });
  }
}

/**
 * Creates a native Intl.NumberFormat instance based on options
 */
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

  return new Intl.NumberFormat(opts.locale, {
    style: 'decimal',
    minimumFractionDigits: opts.minFractionDigits,
    maximumFractionDigits: opts.maxFractionDigits,
  });
}

/**
 * Extracts min/max fraction digits from Angular's digitsInfo format (e.g. '1.2-2')
 */
function parseDigitsInfo(digitsInfo: string): {
  minFractionDigits: number;
  maxFractionDigits: number;
} {
  const parts = digitsInfo.split('-');
  const minMax = parts[1]?.split('.') ?? [];

  return {
    minFractionDigits: minMax[0] ? parseInt(minMax[0], 10) : 0,
    maxFractionDigits: minMax[1] ? parseInt(minMax[1], 10) : 2,
  };
}
