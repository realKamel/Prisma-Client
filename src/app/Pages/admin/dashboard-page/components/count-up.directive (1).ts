import {
  AfterViewInit,
  Directive,
  ElementRef,
  NgZone,
  OnDestroy,
  inject,
  input,
} from '@angular/core';
import { toAr } from './ar-digits.util';


@Directive({
  selector: '[countUp]',
  standalone: true,
})
export class CountUpDirective implements AfterViewInit, OnDestroy {
  readonly countUpTarget = input<number>(0);
  readonly countUpDuration = input<number>(1400);

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);
  private observer?: IntersectionObserver;
  private rafId?: number;

  ngAfterViewInit(): void {
    this.el.nativeElement.textContent = toAr(0);

    this.zone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              this.animate();
              this.observer?.unobserve(this.el.nativeElement);
            }
          }
        },
        { threshold: 0.5 },
      );
      this.observer.observe(this.el.nativeElement);
    });
  }

  private animate(): void {
    const target = this.countUpTarget();
    const duration = this.countUpDuration();
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.el.nativeElement.textContent = toAr(Math.round(eased * target));
      if (progress < 1) {
        this.rafId = requestAnimationFrame(tick);
      } else {
        this.el.nativeElement.textContent = toAr(target);
      }
    };
    this.rafId = requestAnimationFrame(tick);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }
}
