import { DOCUMENT } from '@angular/common';
import { Component, computed, inject, Renderer2, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Lang, LanguageService } from '../../../core/Services/language';

@Component({
  selector: 'app-offline-overlay',
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
          class="rounded-card bg-surface-subtle text-ink flex animate-[offlineFadeIn_300ms_ease-out-custom] flex-col items-center gap-4 px-8 py-6 text-center shadow-2xl"
        >
          <span
            class="h-3.5 w-3.5 animate-[offlinePulse_1.8s_ease-in-out_infinite] rounded-full bg-red-500 shadow-[0_0_16px_rgba(239,68,68,0.8)]"
          ></span>
          <h2 class="m-0 text-lg font-black">{{ offlineTitle() }}</h2>
          <p class="text-muted m-0 -mt-2 text-xs">{{ offlineSubtitle() }}</p>
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
export class OfflineOverlayComponent {
  private readonly doc = inject(DOCUMENT);
  private readonly renderer = inject(Renderer2);
  private readonly translate = inject(TranslateService);
  private readonly language = inject(LanguageService);

  protected readonly isOffline = signal(!navigator.onLine);

  /**
   * Language-aware copy rendered when `TranslateService` cannot resolve a key:
   * a missing entry echoes the raw key back (ngx-translate's DefaultMissingTranslationHandler)
   * and an entry that has not loaded yet resolves to an empty value.
   */
  private readonly OFFLINE_FALLBACK: Record<Lang, { title: string; subtitle: string }> = {
    ar: {
      title: 'لا يوجد اتصال بالإنترنت',
      subtitle: 'تم إيقاف التفاعل مؤقتاً لحين عودة الاتصال',
    },
    en: {
      title: 'No Internet Connection',
      subtitle: 'Interaction paused until connection is restored',
    },
  };

  private readonly fallback = computed(() => this.OFFLINE_FALLBACK[this.language.lang()]);

  protected readonly offlineTitle = computed(() =>
    this.resolve('COMMON.OFFLINE.TITLE', this.fallback().title),
  );

  protected readonly offlineSubtitle = computed(() =>
    this.resolve('COMMON.OFFLINE.SUBTITLE', this.fallback().subtitle),
  );

  constructor() {
    if (!navigator.onLine) {
      this.toggleBodyLock(true);
    }
  }

  protected onOnline(): void {
    this.isOffline.set(false);
    this.toggleBodyLock(false);
  }

  protected onOffline(): void {
    this.isOffline.set(true);
    this.toggleBodyLock(true);
  }

  /**
   * Reactive lookup (tracks `currentLang`) that degrades to `fallbackText`
   * whenever the key is missing or its translation has not loaded yet.
   */
  private resolve(key: string, fallbackText: string): string {
    const value = this.translate.translate(key)();
    return typeof value === 'string' && value.length > 0 && value !== key ? value : fallbackText;
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
