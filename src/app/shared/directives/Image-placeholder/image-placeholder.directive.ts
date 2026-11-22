import { booleanAttribute, computed, Directive, effect, input, signal } from '@angular/core';

const BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

/**
 * Add `appImagePlaceholder` to any <img> and keep using a normal src.
 *
 *   <img appImagePlaceholder [src]="url" alt="" class="w-64 aspect-video object-cover" />
 *
 * - loading -> translucent pulsing skeleton (the image is not shown yet)
 * - done    -> the image, shown all at once
 *
 * Optional: eager  -> disable lazy loading
 */
@Directive({
  selector: 'img[appImagePlaceholder]',
  standalone: true,
  host: {
    '[attr.src]': 'currentSrc()',
    '[attr.loading]': 'eager() ? "eager" : "lazy"',
    '[attr.fetchpriority]': 'eager() ? "high" : null',
    decoding: 'async',
    '[class]': 'stateClasses()',
  },
})
export class ImagePlaceholderDirective {
  /** The image's own src (static or bound). */
  readonly src = input<string | null | undefined>(null);
  readonly eager = input(false, { transform: booleanAttribute });

  // The last URL that finished downloading (tracked by URL, so it resets when src changes).
  private readonly doneSrc = signal<string | null>(null);

  constructor() {
    // Download the image off-screen; it is only shown once fully loaded.
    effect((onCleanup) => {
      const url = this.src();
      if (!url || typeof Image === 'undefined') return;

      let stale = false;
      onCleanup(() => (stale = true));

      const probe = new Image();
      // on error the browser's normal broken-image behavior takes over
      probe.onload = probe.onerror = () => !stale && this.doneSrc.set(url);
      probe.src = url;
    });
  }

  protected readonly loading = computed(() => {
    const url = this.src();
    return !!url && this.doneSrc() !== url;
  });

  protected readonly currentSrc = computed(() => (this.loading() ? BLANK : this.src()));

  // translucent tint: the page background shows through and the tint pulses
  protected readonly stateClasses = computed(() =>
    this.loading() ? 'animate-pulse bg-black/5 dark:bg-white/10' : '',
  );
}