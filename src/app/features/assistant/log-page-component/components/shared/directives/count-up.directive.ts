import { DecimalPipe, isPlatformBrowser } from '@angular/common';
import { Directive, ElementRef, OnChanges, PLATFORM_ID, inject, input } from '@angular/core';

@Directive({
  selector: '[appCountUp]',
  providers: [DecimalPipe],
})
export class CountUpDirective implements OnChanges {
  public readonly target = input(0, { alias: 'appCountUp' });
  private readonly numberPipe = inject(DecimalPipe);
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly platId = inject(PLATFORM_ID);

  ngOnChanges(): void {
    if (!isPlatformBrowser(this.platId)) {
      this.el.nativeElement.textContent = this.numberPipe.transform(this.target());
      return;
    }

    const dur = 1200;
    const start = performance.now();

    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3); // ease-out cubic
      this.el.nativeElement.textContent = this.numberPipe.transform(
        Math.round(ease * this.target()),
      );
      if (p < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }
}
