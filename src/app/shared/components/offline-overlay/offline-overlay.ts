import { Component, inject, Renderer2, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-offline-overlay',
  imports: [TranslatePipe],
  host: {
    '(window:online)': 'onOnline()',
    '(window:offline)': 'onOffline()',
  },
  template: `
    @if (isOffline()) {
      <div
        class="fixed inset-0 z-9999998 flex items-center justify-center bg-black/30 backdrop-blur-[5px]"
        role="alert"
        aria-live="assertive"
      >
        <div
          class="flex animate-[offlineFadeIn_300ms_ease-out-custom] flex-col items-center gap-4 rounded-card bg-surface-subtle px-8 py-6 text-center text-ink shadow-2xl"
        >
          <span
            class="h-3.5 w-3.5 animate-[offlinePulse_1.8s_ease-in-out_infinite] rounded-full bg-red-500 shadow-[0_0_16px_rgba(239,68,68,0.8)]"
          ></span>
          <h2 class="m-0 text-lg font-black">{{ 'COMMON.OFFLINE.TITLE' | translate }}</h2>
          <p class="-mt-2 m-0 text-xs text-muted">{{ 'COMMON.OFFLINE.SUBTITLE' | translate }}</p>
        </div>
      </div>
    }
  `,
  styles: `
    @keyframes offlinePulse {
      0%,
      100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.4;
        transform: scale(0.85);
      }
    }
    @keyframes offlineFadeIn {
      from {
        transform: scale(0.9);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }
  `,
})
export class OfflineOverlay {
  private readonly doc = inject(DOCUMENT);
  private readonly renderer = inject(Renderer2);

  protected readonly isOffline = signal(!navigator.onLine);

  constructor() {
    if (!navigator.onLine) {
      this.toggleBodyLock(true);
    }
  }

  onOnline(): void {
    this.isOffline.set(false);
    this.toggleBodyLock(false);
  }

  onOffline(): void {
    this.isOffline.set(true);
    this.toggleBodyLock(true);
  }

  private toggleBodyLock(lock: boolean): void {
    const html = this.doc.documentElement;
    if (lock) {
      this.renderer.addClass(html, 'is-offline');
    } else {
      this.renderer.removeClass(html, 'is-offline');
    }
  }
}
