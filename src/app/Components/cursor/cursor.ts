import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-cursor',
  imports: [],
  template: `
      <div #dot></div>
      <div #ring></div>
  `,
  styleUrl: './cursor.css',
})
export class Cursor implements OnDestroy {
  private readonly dotRef = viewChild<ElementRef<HTMLDivElement>>('dot');
  private readonly ringRef = viewChild<ElementRef<HTMLDivElement>>('ring');

  private document = inject(DOCUMENT);
  private destroyRef = inject(DestroyRef);
  private rafId = 0;
  protected readonly isFinePointer = signal(false);

  constructor() {
    afterNextRender(() => {
      this.isFinePointer.set(window.matchMedia('(pointer: fine)').matches);
      if (!this.isFinePointer()) return;
      this.document.body.style.cursor = 'none';
      this.initCursor();
    });
  }
  ngOnDestroy() {
    cancelAnimationFrame(this.rafId);
    this.document.body.style.cursor = '';
    this.document.body.classList.remove('ch', 'text-c', 'ck');
  }

  private initCursor() {
    const doc = this.document;
    const dot = this.dotRef()?.nativeElement;
    const ring = this.ringRef()?.nativeElement;
    if (!dot || !ring) return;

    const body = doc.body;
    const opts = { passive: true } as const;

    let mx = -200,
      my = -200;
    let rx = -200,
      ry = -200;

    fromEvent<MouseEvent>(doc, 'mousemove', opts)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((e) => {
        mx = e.clientX;
        my = e.clientY;
        dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      });

    const hoverSelector = 'a, button, [role="button"]';
    const textSelector = 'input, textarea, select';

    fromEvent<MouseEvent>(doc, 'mouseover', opts)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((e) => {
        const target = e.target as HTMLElement;
        if (target.closest(hoverSelector)) body.classList.add('ch');
        else if (target.closest(textSelector)) body.classList.add('text-c');
      });

    fromEvent<MouseEvent>(doc, 'mouseout', opts)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((e) => {
        const target = e.target as HTMLElement;
        if (target.closest(hoverSelector)) body.classList.remove('ch');
        else if (target.closest(textSelector)) body.classList.remove('text-c');
      });

    fromEvent(doc, 'mousedown', opts)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => body.classList.add('ck'));

    fromEvent(doc, 'mouseup', opts)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => body.classList.remove('ck'));

    fromEvent(doc, 'mouseleave', opts)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        dot.style.opacity = '0';
        ring.style.opacity = '0';
      });

    fromEvent(doc, 'mouseenter', opts)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        dot.style.opacity = '';
        ring.style.opacity = '';
      });

    const lerpRing = () => {
      rx += (mx - rx) * 0.13;
      ry += (my - ry) * 0.13;
      ring.style.transform = `translate3d(${rx.toFixed(1)}px, ${ry.toFixed(1)}px, 0) translate(-50%, -50%)`;
      this.rafId = requestAnimationFrame(lerpRing);
    };
    lerpRing();
  }
}
