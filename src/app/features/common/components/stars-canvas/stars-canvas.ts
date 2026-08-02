import { AfterViewInit, Component, ElementRef, OnDestroy, viewChildren } from '@angular/core';

const STAR_COUNT = 160;
const LAYER_COUNT = 3;
const STAR_COLOR = '247,201,72';

interface Star {
  x: number;
  y: number;
  r: number;
  alpha: number;
}

@Component({
  selector: 'app-stars-canvas',
  template: `
    @for (idx of layerIndices; track idx) {
      <canvas #layer [class]="'layer layer-' + idx" aria-hidden="true"></canvas>
    }
  `,
  styles: [
    `
      :host {
        position: fixed;
        inset: 0;
        z-index: 0;
        pointer-events: none;
      }

      canvas.layer {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        opacity: 0.42;
        animation: twinkle 4.5s ease-in-out infinite alternate;
      }

      canvas.layer-1 {
        animation-duration: 6s;
        animation-delay: -2s;
      }

      canvas.layer-2 {
        animation-duration: 7.5s;
        animation-delay: -4s;
      }

      @keyframes twinkle {
        from {
          opacity: 0.3;
        }
        to {
          opacity: 0.62;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        canvas.layer {
          animation: none;
          opacity: 0.42;
        }
      }
    `,
  ],
})
export class StarsCanvas implements AfterViewInit, OnDestroy {
  protected readonly layerIndices = Array.from({ length: LAYER_COUNT }, (_, i) => i);
  readonly layerRefs = viewChildren<ElementRef<HTMLCanvasElement>>('layer');

  /** Static star field split into LAYER_COUNT groups — computed once, never re-drawn per frame. */
  private stars: Star[][] = Array.from({ length: LAYER_COUNT }, () => []);

  private onResize = () => this.renderAll();

  ngAfterViewInit() {
    this.buildStars();
    window.addEventListener('resize', this.onResize);
    this.renderAll();
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.onResize);
  }

  /** Generate the full static star field once and distribute stars across the layers. */
  private buildStars() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    for (let i = 0; i < STAR_COUNT; i++) {
      this.stars[i % LAYER_COUNT].push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.4 + 0.3,
        alpha: Math.random() * 0.5 + 0.2,
      });
    }
  }

  /**
   * Paint each layer's stars exactly once. Stars never move — the only animation is
   * the CSS opacity twinkle, which the compositor runs with zero JavaScript cost.
   */
  private renderAll() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.layerRefs().forEach((ref, i) => {
      const canvas = ref.nativeElement;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);

      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);

      for (const s of this.stars[i]) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${STAR_COLOR},${s.alpha})`;
        ctx.fill();
      }
    });
  }
}
