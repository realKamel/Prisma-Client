import { Component, ElementRef, inject, NgZone, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-stars-canvas',
  standalone: true,
  template: `<canvas #canvas></canvas>`,
  styles: [`
    canvas {
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      opacity: 0.42;
    }
  `]
})
export class StarsCanvas implements OnInit{
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private zone = inject(NgZone);

  ngOnInit() {
    this.zone.runOutsideAngular(() => this.initStars());
  }

  private initStars() {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;

    const STAR_COUNT = 160;

    interface Star {
      x: number;
      y: number;
      r: number;
      alpha: number;
      speed: number;
      dir: number;
    }

    let stars: Star[] = [];

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const spawn = (): Star => ({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      r:     Math.random() * 1.4 + 0.3,
      alpha: Math.random() * 0.5 + 0.2,
      speed: Math.random() * 0.004 + 0.002,
      dir:   Math.random() < 0.5 ? 1 : -1
    });

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        s.alpha += s.speed * s.dir;
        if (s.alpha >= 0.85) { s.alpha = 0.85; s.dir = -1; }
        if (s.alpha <= 0.1)  { s.alpha = 0.1;  s.dir =  1; }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(247,201,72,${s.alpha})`;
        ctx.fill();
      }
      requestAnimationFrame(draw);
    };

    resize();
    stars = Array.from({ length: STAR_COUNT }, spawn);
    window.addEventListener('resize', resize);
    draw();
  }
}
