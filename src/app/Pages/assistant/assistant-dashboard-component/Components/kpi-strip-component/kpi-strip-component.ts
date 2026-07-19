import {
  Component,
  AfterViewInit,
  ElementRef,
  PLATFORM_ID,
  inject,
  viewChildren,
  input,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { KpiTile } from '../../../../../core/Models/Assistant/assistant-dashboard.model';

@Component({
  selector: 'app-kpi-strip',

  imports: [],
  templateUrl: './kpi-strip-component.html',
})
export class KpiStripComponent implements AfterViewInit {
  readonly kpis = input<KpiTile[]>([]);
  readonly counterEls = viewChildren<ElementRef<HTMLSpanElement>>('counter');

  private platformId = inject(PLATFORM_ID);

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          this.counterEls().forEach((el, i) =>
            this.animate(el.nativeElement, this.kpis()[i]?.value ?? 0),
          );
          observer.disconnect();
        });
      },
      { threshold: 0.3 },
    );
    const counterEls = this.counterEls();
    if (counterEls.at(0)!) observer.observe(counterEls.at(0)!.nativeElement.closest('.kpi-strip')!);
  }

  private animate(el: HTMLSpanElement, target: number): void {
    const dur = 1200;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = this.toAr(Math.round(ease * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  toAr(n: number): string {
    return String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d]);
  }

  variantClasses(variant: string): {
    bar: string;
    valueStyle: string;
    deltaStyle: string;
  } {
    const map: Record<string, { bar: string; valueStyle: string; deltaStyle: string }> = {
      purple: {
        bar: 'background:  var(--purple);',
        valueStyle: 'color: var(--ink);',
        deltaStyle: 'color: var(--purple-lt);',
      },
      mint: {
        bar: 'background: var(--mint);',
        valueStyle: 'color: var(--ink);',
        deltaStyle: 'color: var(--mint);',
      },
      star: {
        bar: 'background: var(--star);',
        valueStyle: 'color: var(--ink);',
        deltaStyle: 'color: var(--coral);', // matches screenshot: delta is coral/red on star card
      },
      coral: {
        bar: 'background: var(--coral);',
        valueStyle: 'color: var(--ink);',
        deltaStyle: 'color: var(--mint);', // matches screenshot: delta is mint/green on coral card
      },
    };
    return map[variant] ?? map['purple'];
  }
}
