import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { toAr } from '../to-ar.util';


/**
 * Animates a numeric value from 0 to the given target once the host element
 * scrolls into view, rendering the result with Arabic-Indic numerals.
 *
 * Usage: <span [appCountUp]="12750"></span>
 */
@Directive({
  selector: '[appCountUp]',
  standalone: true,
})
export class CountUpDirective implements OnInit, OnDestroy {
  @Input('appCountUp') target = 0;

  private observer?: IntersectionObserver;
  private readonly durationMs = 1200;

  constructor(private readonly el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    this.el.nativeElement.textContent = toAr(0);

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          this.animateTo(this.target);
          this.observer?.unobserve(this.el.nativeElement);
        }
      },
      { threshold: 0.5 }
    );

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private animateTo(target: number): void {
    const start = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - start) / this.durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.el.nativeElement.textContent = toAr(Math.round(eased * target));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        this.el.nativeElement.textContent = toAr(target);
      }
    };

    requestAnimationFrame(step);
  }
}
