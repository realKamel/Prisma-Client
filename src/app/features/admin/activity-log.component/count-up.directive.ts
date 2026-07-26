import { AfterViewInit, Directive, ElementRef, OnDestroy, inject, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

/**
 * Animates the host element's text from 0 up to [appCountUp] once the
 * element scrolls into view, rendering locale-aware numerals.
 */
@Directive({
  selector: '[appCountUp]',
  standalone: true,
  providers: [DecimalPipe],
})
export class CountUpDirective implements AfterViewInit, OnDestroy {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  public appCountUp = input<number>(0);
  public duration = input<number>(900);

  private readonly numberPipe = inject(DecimalPipe);
  private observer?: IntersectionObserver;
  private frameId?: number;

  ngAfterViewInit(): void {
    this.el.nativeElement.textContent = this.numberPipe.transform(0) ?? '';

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.runAnimation();
            this.observer?.unobserve(this.el.nativeElement);
          }
        }
      },
      { threshold: 0.5 },
    );
    this.observer.observe(this.el.nativeElement);
  }

  private runAnimation(): void {
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / this.duration(), 1);
      this.el.nativeElement.textContent = this.numberPipe.transform(
        Math.round(progress * this.appCountUp()),
      ) ?? '';
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
