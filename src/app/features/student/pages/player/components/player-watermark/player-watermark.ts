import { afterNextRender, Component, DestroyRef, ElementRef, inject, input, signal } from '@angular/core';

/** "معاذ · 4417": first name plus the last 4 digits of the phone. Never the full number. */
export function buildWatermarkText(
  name: string | null | undefined,
  email: string | null | undefined,
): string {
    const s = [name, email].filter(Boolean).join('\n')
    console.log(JSON.stringify(s));
    return s;
}

interface WatermarkLabel {
  opacity: number;
  /** Seconds to cross the frame one way, horizontally and vertically. */
  durX: number;
  durY: number;
  /** Negative delays start each axis at a random point of its cycle. */
  delayX: number;
  delayY: number;
}

const GUARD_EVERY_MS = 3_000;

const between = (min: number, max: number): number => min + Math.random() * (max - min);

function makeLabel(opacity: number): WatermarkLabel {
  // Different speeds on the two axes make the path wander instead of repeating quickly.
  const durX = between(44, 72);
  const durY = between(28, 50);
  return {
    opacity,
    durX,
    durY,
    delayX: -between(0, durX * 2),
    delayY: -between(0, durY * 2),
  };
}

@Component({
  selector: 'app-player-watermark',
  templateUrl: './player-watermark.html',
  styleUrl: './player-watermark.css',
  host: { 'aria-hidden': 'true' },
})
export class PlayerWatermarkComponent {
  public readonly text = input.required<string>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  /** A main label and a fainter second one, each on its own random path. */
  protected readonly labels: readonly WatermarkLabel[] = [makeLabel(0.22), makeLabel(0.12)];

  /** Bumping this re-creates the labels, in case they were deleted or hidden. */
  protected readonly epoch = signal(0);

  private guardTimer: ReturnType<typeof setInterval> | undefined;

  constructor() {
    afterNextRender(() => {
      const parent = this.host.nativeElement.parentElement;
      this.guardTimer = setInterval(() => this.guard(parent), GUARD_EVERY_MS);
    });

    this.destroyRef.onDestroy(() => clearInterval(this.guardTimer));
  }

  // Deterrent, not security: anyone with DevTools can still win. This only makes the
  // casual "delete the element, then record" route fail.
  private guard(parent: HTMLElement | null): void {
    const el = this.host.nativeElement;

    if (parent && !el.isConnected) parent.appendChild(el);

    const labels = Array.from(el.querySelectorAll<HTMLElement>('.wm'));
    const intact = labels.length === this.labels.length && labels.every((l) => this.isShown(l));
    if (intact) return;

    el.removeAttribute('style');
    el.removeAttribute('hidden');
    this.epoch.update((n) => n + 1);
  }

  private isShown(label: HTMLElement): boolean {
    const style = getComputedStyle(label);
    const box = label.getBoundingClientRect();
    return (
      getComputedStyle(this.host.nativeElement).display !== 'none' &&
      style.display !== 'none' &&
      style.visibility === 'visible' &&
      parseFloat(style.opacity) > 0.05 &&
      box.width > 4 &&
      box.height > 4
    );
  }
}