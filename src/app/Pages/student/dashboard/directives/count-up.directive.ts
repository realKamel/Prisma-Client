// dashboard/directives/count-up.directive.ts
import {
  Directive, Input, ElementRef, OnChanges, SimpleChanges, OnDestroy
} from '@angular/core';

/**
 * Animates a number from 0 → [target] using an eased rAF loop,
 * triggered when the host element enters the viewport.
 *
 * Usage:
 *   <div appCountUp [target]="stats.completedLessons">0</div>
 *   <span appCountUp [target]="stats.studyHours">0</span>
 *
 * The directive writes arabic-numeral digits via toLocaleString('ar-EG').
 * Duration is 1 100 ms with a cubic ease-out, matching the original JS.
 */
@Directive({
  selector: '[appCountUp]',
  standalone: true,
})
export class CountUpDirective implements OnChanges, OnDestroy {
  @Input({ required: true }) target = 0;

  private observer: IntersectionObserver | null = null;
  private rafId: number | null = null;
  private hasAnimated = false;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['target']) {
      this.hasAnimated = false;
      this.setupObserver();
    }
  }

  private setupObserver(): void {
    this.cleanup();

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.hasAnimated) {
            this.hasAnimated = true;
            this.animateCount();
            this.observer?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    this.observer.observe(this.el.nativeElement);
  }

  private animateCount(): void {
    const dur = 1100;
    const start = performance.now();
    const target = this.target;
    const el = this.el.nativeElement;

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);           // cubic ease-out
      const val = Math.round(target * eased);
      el.textContent = this.toArabicNum(val);
      if (t < 1) {
        this.rafId = requestAnimationFrame(step);
      }
    };

    this.rafId = requestAnimationFrame(step);
  }

  /** Converts western digits to Eastern Arabic-Indic numerals */
  private toArabicNum(n: number): string {
    return n.toLocaleString('ar-EG');
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private cleanup(): void {
    this.observer?.disconnect();
    this.observer = null;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}