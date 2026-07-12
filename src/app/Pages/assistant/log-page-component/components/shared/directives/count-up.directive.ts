import {
  Directive, Input, OnChanges, ElementRef,
  PLATFORM_ID, inject
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appCountUp]',
  standalone: true,
})
export class CountUpDirective implements OnChanges {
  @Input('appCountUp') target = 0;

  private readonly el     = inject(ElementRef<HTMLElement>);
  private readonly platId = inject(PLATFORM_ID);

  ngOnChanges(): void {
    if (!isPlatformBrowser(this.platId)) {
      this.el.nativeElement.textContent = this.toAr(this.target);
      return;
    }

    const dur   = 1200;
    const start = performance.now();

    const tick = (now: number) => {
      const p    = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);          // ease-out cubic
      this.el.nativeElement.textContent = this.toAr(Math.round(ease * this.target));
      if (p < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }

  private toAr(n: number): string {
    return String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);
  }
}
