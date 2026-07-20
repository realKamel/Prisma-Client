import { Component, DestroyRef, ElementRef, inject, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import { DOCUMENT } from '@angular/common';


@Component({
  selector: 'app-cursor',
  imports: [],
  template:`
    <div #dot></div>
    <div #ring></div>
  `,
  styleUrl: './cursor.css',
})
export class Cursor implements OnInit, OnDestroy {
@ViewChild('dot',  { static: true }) dotRef!:  ElementRef<HTMLDivElement>;
  @ViewChild('ring', { static: true }) ringRef!: ElementRef<HTMLDivElement>;

  private zone       = inject(NgZone);
  private document   = inject(DOCUMENT);
  private destroyRef = inject(DestroyRef);
  private rafId      = 0;

  ngOnInit() {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    this.document.body.style.cursor = 'none';
    this.zone.runOutsideAngular(() => this.initCursor());
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.rafId);
  }

  private initCursor() {
    const doc   = this.document;
    const cDot  = this.dotRef.nativeElement;
    const cRing = this.ringRef.nativeElement;

    let mx = -200, my = -200;
    let rx = -200, ry = -200;

    // Mouse position
    fromEvent<MouseEvent>(doc, 'mousemove')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(e => {
        mx = e.clientX;
        my = e.clientY;
        cDot.style.left = mx + 'px';
        cDot.style.top  = my + 'px';
      });

    // Hover — event delegation
    fromEvent<MouseEvent>(doc, 'mouseover')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(e => {
        if ((e.target as HTMLElement).closest('a, button, [role="button"]')) {
          doc.body.classList.add('ch');
        }
      });

    fromEvent<MouseEvent>(doc, 'mouseout')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(e => {
        if ((e.target as HTMLElement).closest('a, button, [role="button"]')) {
          doc.body.classList.remove('ch');
        }
      });

    // Text inputs
    fromEvent<MouseEvent>(doc, 'mouseover')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(e => {
        if ((e.target as HTMLElement).closest('input, textarea, select')) {
          doc.body.classList.add('text-c');
        }
      });

    fromEvent<MouseEvent>(doc, 'mouseout')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(e => {
        if ((e.target as HTMLElement).closest('input, textarea, select')) {
          doc.body.classList.remove('text-c');
        }
      });

    // Click
    fromEvent(doc, 'mousedown')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => doc.body.classList.add('ck'));

    fromEvent(doc, 'mouseup')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => doc.body.classList.remove('ck'));

    // Visibility
    fromEvent(doc, 'mouseleave')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        cDot.style.opacity  = '0';
        cRing.style.opacity = '0';
      });

    fromEvent(doc, 'mouseenter')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        cDot.style.opacity  = '';
        cRing.style.opacity = '';
      });

    // Ring lerp
    const lerpRing = () => {
      rx += (mx - rx) * 0.13;
      ry += (my - ry) * 0.13;
      cRing.style.left = rx.toFixed(1) + 'px';
      cRing.style.top  = ry.toFixed(1) + 'px';
      this.rafId = requestAnimationFrame(lerpRing);
    };
    lerpRing();
  }

}
