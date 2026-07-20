import { AfterViewInit, Directive, ElementRef, Input, OnDestroy } from '@angular/core';
import { ArabicNumeralsPipe } from './components/pipes/arabic-numerals.pipe';

/**
 * Animates the host element's text from 0 up to [appCountUp] once the
 * element scrolls into view, rendering Arabic-Indic numerals — same
 * behavior as the original animCounter()/IntersectionObserver pair.
 */
@Directive({
  selector: '[appCountUp]',
  standalone: true,
})
export class CountUpDirective implements AfterViewInit, OnDestroy {
  @Input('appCountUp') target = 0;
  @Input() duration = 900;

  private readonly numerals = new ArabicNumeralsPipe();
  private observer?: IntersectionObserver;
  private frameId?: number;

  constructor(private readonly el: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    this.el.nativeElement.textContent = this.numerals.transform(0);

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.runAnimation();
            this.observer?.unobserve(this.el.nativeElement);
          }
        }
      },
      { threshold: 0.5 }
    );
    this.observer.observe(this.el.nativeElement);
  }

  private runAnimation(): void {
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / this.duration, 1);
      this.el.nativeElement.textContent = this.numerals.transform(Math.round(progress * this.target));
      if (progress < 1) {
        this.frameId = requestAnimationFrame(step);
      }
    };
    this.frameId = requestAnimationFrame(step);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    if (this.frameId) cancelAnimationFrame(this.frameId);
  }
}
