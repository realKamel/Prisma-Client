import {
  Directive,
  ElementRef,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  inject,
  input,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Directive({
  selector: '[appCountUp]',
})
export class CountUpDirective implements OnInit, OnChanges, OnDestroy {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly numberPipe = inject(DecimalPipe);
  readonly target = input(0, { alias: 'appCountUp' });

  private observer?: IntersectionObserver;
  private hasAnimated = false;
  private readonly durationMs = 1200;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  ngOnInit(): void {
    this.el.nativeElement.textContent = this.numberPipe.transform(0);

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const target = this.target();
          if (target === 0) return; // wait for real data
          this.hasAnimated = true;
          this.animateTo(target);
          this.observer?.unobserve(this.el.nativeElement);
        }
      },
      { threshold: 0.5 },
    );

    this.observer.observe(this.el.nativeElement);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const change = changes['target'];
    if (!change || change.currentValue === 0) return;

    // Data arrived — if element is already visible and hasn't animated yet, go now
    if (!this.hasAnimated) {
      this.checkVisibilityAndAnimate();
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private checkVisibilityAndAnimate(): void {
    const rect = this.el.nativeElement.getBoundingClientRect();
    const isVisible =
      rect.top < window.innerHeight &&
      rect.bottom > 0 &&
      rect.left < window.innerWidth &&
      rect.right > 0;

    if (isVisible) {
      this.hasAnimated = true;
      this.observer?.unobserve(this.el.nativeElement);
      this.animateTo(this.target());
    }
    // else: the IntersectionObserver will handle it when it scrolls in
  }

  private animateTo(target: number): void {
    const start = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - start) / this.durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.el.nativeElement.textContent = this.numberPipe.transform(Math.round(eased * target));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        this.el.nativeElement.textContent = this.numberPipe.transform(target);
      }
    };

    requestAnimationFrame(step);
  }
}
