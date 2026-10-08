import {
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  inject,
  input,
  OnDestroy,
  OnInit,
  output,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
// Registering the Video.js custom elements is a side effect of these imports:
// the player (state), the hls.js-backed media element, and every control this
// custom UI composes. The packaged `<video-skin>` is deliberately not imported:
// its controls live in a shadow root, so PiP/Cast cannot be removed from it and
// seek buttons cannot be added to it.
import { TranslatePipe } from '@ngx-translate/core';
import { selectPlayback, selectPlaybackRate, type PlayerStore } from '@videojs/core/dom';
import { resolveAdapterType } from '@videojs/html';
import '@videojs/html/i18n';
import '@videojs/html/icons/element';
import '@videojs/html/media/hlsjs-video';
import '@videojs/html/ui/buffering-indicator';
import '@videojs/html/ui/captions-button';
import '@videojs/html/ui/captions-radio-group';
import '@videojs/html/ui/container';
import '@videojs/html/ui/controls';
import '@videojs/html/ui/controls-backdrop';
import '@videojs/html/ui/controls-content';
import '@videojs/html/ui/controls-group';
import '@videojs/html/ui/dialog-backdrop';
import '@videojs/html/ui/dialog-close';
import '@videojs/html/ui/dialog-description';
import '@videojs/html/ui/dialog-popup';
import '@videojs/html/ui/dialog-title';
import '@videojs/html/ui/error-dialog';
import '@videojs/html/ui/fullscreen-button';
import '@videojs/html/ui/gesture';
import '@videojs/html/ui/hotkey';
import '@videojs/html/ui/menu';
import '@videojs/html/ui/menu-content';
import '@videojs/html/ui/menu-item';
import '@videojs/html/ui/menu-item-indicator';
import '@videojs/html/ui/menu-radio-item';
import '@videojs/html/ui/menu-separator';
import '@videojs/html/ui/mute-button';
import '@videojs/html/ui/play-button';
import '@videojs/html/ui/playback-rate-radio-group';
import '@videojs/html/ui/poster';
import '@videojs/html/ui/quality-radio-group';
import '@videojs/html/ui/seek-indicator';
import '@videojs/html/ui/seek-indicator-value';
import '@videojs/html/ui/slider-buffer';
import '@videojs/html/ui/slider-fill';
import '@videojs/html/ui/slider-preview';
import '@videojs/html/ui/slider-thumb';
import '@videojs/html/ui/slider-thumbnail';
import '@videojs/html/ui/slider-track';
import '@videojs/html/ui/slider-value';
import '@videojs/html/ui/status-announcer';
import '@videojs/html/ui/status-indicator';
import '@videojs/html/ui/status-indicator-value';
import '@videojs/html/ui/time';
import '@videojs/html/ui/time-group';
import '@videojs/html/ui/time-separator';
import '@videojs/html/ui/time-slider';
import '@videojs/html/ui/title';
import '@videojs/html/ui/tooltip';
import '@videojs/html/ui/tooltip-group';
import '@videojs/html/ui/tooltip-label';
import '@videojs/html/ui/tooltip-shortcut';
import '@videojs/html/ui/volume-indicator';
import '@videojs/html/ui/volume-indicator-fill';
import '@videojs/html/ui/volume-indicator-value';
import '@videojs/html/ui/volume-slider';
import '@videojs/html/video/player';
import { LessonService } from '../../../../../../core/Services/lesson.service';
/** Minimal shape shared by `<video>` and `<hlsjs-video>` for progress tracking. */
type MediaElementLike = HTMLElement & { currentTime: number; duration: number };

/**
 * One instance == one section. The parent renders this inside an @for keyed by
 * sectionId, so switching sections destroys this component (ngOnDestroy saves
 * the resume point) and creates a fresh one (ngOnInit starts progress, the
 * can-play handler resumes). Video.js tears its elements down automatically
 * when Angular removes them from the DOM, so no manual destroy is required.
 */
@Component({
  selector: 'app-videojs-player',
  imports: [TranslatePipe],
  templateUrl: './videojs-player.html',
  styleUrl: './videojs-player.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})
export class VideoJsPlayerComponent implements OnInit, OnDestroy {
  public readonly videoUrl = input.required<string>();
  public readonly sectionId = input.required<number>();
  public readonly savedProgress = input<number>(0);
  public readonly alreadyCompleted = input<boolean>(false);
  public readonly thumbnailsUrl = input<string>();
  public readonly posterUrl = input<string>();
  public readonly lessonTitle = input<string>('');
  public readonly sectionCompleted = output<void>();

  protected readonly lessonService = inject(LessonService);

  // Counts as "finished" once this many seconds (or fewer) remain. Also fires
  // right after a seek into that window, since it's checked on every time-update.
  private static readonly COMPLETION_THRESHOLD_SECONDS = 10;
  private static readonly RETRY_COOLDOWN_MS = 10_000;

  /**
   * Hold Space to preview at 2x, YouTube-style. A press-and-hold cannot be a
   * `<media-hotkey>`: that element only fires on keydown, so there is no edge to
   * restore on. A tap still toggles play/pause as before; a hold starts the
   * boost once it outlasts the delay, and releasing restores the rate and the
   * paused state the hold started from.
   */
  private static readonly BOOST_RATE = 2;
  private static readonly HOLD_DELAY_MS = 220;

  /**
   * The previous player picked its provider from the URL automatically;
   * Video.js makes us choose the media element. `<hlsjs-video>` covers the
   * app's `.m3u8` sources and a plain `<video>` covers progressive files.
   * Unknown sources default to HLS, matching the previous hls.js behaviour.
   */
  protected readonly useHls = computed(() => resolveAdapterType(this.videoUrl()) !== 'video');

  private lastTime = 0;
  private completed = false;
  private resumed = false;
  private retryAfter = 0;

  /** `<video-player>` owns the store and exposes it publicly. */
  private readonly playerRef = viewChild<ElementRef<{ store: PlayerStore }>>('videojsPlayer');

  private holdTimer: ReturnType<typeof setTimeout> | null = null;
  private boost: { rate: number; paused: boolean } | null = null;
  private spaceDown = false;

  /** Drives the badge beside the title; null whenever the boost is not running. */
  protected readonly boostRate = signal<number | null>(null);

  protected readonly handleCanPlay = (event: Event): void => {
    if (this.resumed) return;
    const media = this.mediaFrom(event);
    if (!media) return;
    this.resumed = true;

    const progress = this.savedProgress();
    if (!this.alreadyCompleted() && progress > 0) {
      media.currentTime = progress;
    }
  };

  protected readonly handleTimeUpdate = (event: Event): void => {
    const media = this.mediaFrom(event);
    if (!media) return;

    this.lastTime = media.currentTime;

    if (this.completed) return;
    const duration = media.duration;
    if (!(duration > 0)) return;

    // min(): a video shorter than 2x the threshold must not complete instantly.
    const threshold = Math.min(VideoJsPlayerComponent.COMPLETION_THRESHOLD_SECONDS, duration / 2);
    if (duration - this.lastTime <= threshold) {
      this.markAsCompleted();
    }
  };

  protected readonly handleEnded = (): void => this.markAsCompleted();

  private readonly handlePageHide = (): void => this.saveProgressOnUnload();

  // --- Hold Space to preview at 2x ------------------------------------------

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (!this.isSpace(event) || this.isTypingTarget(event.target)) return;
    // Leave the browser's own combinations alone (Alt+Space opens the window menu).
    if (event.ctrlKey || event.altKey || event.metaKey) return;

    // Stop the page scrolling — including on the repeats a hold generates.
    event.preventDefault();
    if (event.repeat || this.spaceDown) return;

    this.spaceDown = true;
    this.holdTimer = setTimeout(() => this.startBoost(), VideoJsPlayerComponent.HOLD_DELAY_MS);
  };

  private readonly handleKeyUp = (event: KeyboardEvent): void => {
    if (!this.isSpace(event) || !this.spaceDown) return;

    this.spaceDown = false;
    this.clearHoldTimer();

    // Released inside the delay: an ordinary Space tap, so toggle as it always did.
    if (this.boost !== null) this.stopBoost();
    else this.togglePlayback();
  };

  /** The window can lose focus mid-hold, and then no keyup ever arrives. */
  private readonly handleWindowBlur = (): void => {
    this.spaceDown = false;
    this.clearHoldTimer();
    this.stopBoost();
  };

  private startBoost(): void {
    this.holdTimer = null;

    const playback = this.playback();
    const rate = this.rate();
    if (!playback || !rate) return;

    const wasPaused = playback.paused;
    this.boost = { rate: rate.playbackRate, paused: wasPaused };
    rate.setPlaybackRate(VideoJsPlayerComponent.BOOST_RATE);
    this.boostRate.set(VideoJsPlayerComponent.BOOST_RATE);

    // A hold is a preview, so it also starts a paused video.
    if (wasPaused) this.ignore(playback.play());
  }

  private stopBoost(): void {
    const boosted = this.boost;
    if (boosted === null) return;
    this.boost = null;
    this.boostRate.set(null);

    // `playbackRate` is re-synced from the native `ratechange`, so the menu's
    // selected rate follows this restore without any extra bookkeeping.
    this.rate()?.setPlaybackRate(boosted.rate);
    if (boosted.paused) this.ignore(this.playback()?.pause());
  }

  private togglePlayback(): void {
    const playback = this.playback();
    if (!playback) return;

    this.ignore(playback.paused ? playback.play() : playback.pause());
  }

  private clearHoldTimer(): void {
    if (this.holdTimer === null) return;

    clearTimeout(this.holdTimer);
    this.holdTimer = null;
  }

  private rate(): ReturnType<typeof selectPlaybackRate> | null {
    const store = this.playerRef()?.nativeElement.store;
    return store ? selectPlaybackRate(store.state) : null;
  }

  private playback(): ReturnType<typeof selectPlayback> | null {
    const store = this.playerRef()?.nativeElement.store;
    return store ? selectPlayback(store.state) : null;
  }

  /** `play()`/`pause()` reject when a newer request supersedes them. */
  private ignore(result: Promise<void> | undefined | void): void {
    if (result instanceof Promise) result.catch(() => undefined);
  }

  private isSpace(event: KeyboardEvent): boolean {
    return event.code === 'Space' || event.key === ' ';
  }

  /** Space belongs to the field the user is typing in, not to the player. */
  private isTypingTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;

    return (
      target.isContentEditable ||
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT'
    );
  }

  public ngOnInit(): void {
    this.completed = this.alreadyCompleted();
    // Real tab close / refresh — ngOnDestroy does not run in that case.
    window.addEventListener('pagehide', this.handlePageHide);
    window.addEventListener('blur', this.handleWindowBlur);
    // Document-scoped, matching the `<media-hotkey target="document">` bindings,
    // so Space works before the player has been clicked.
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);

    if (!this.completed) {
      // "Start" request — idempotent on the backend.
      this.lessonService.startSectionProgress(this.sectionId()).subscribe();
    }
  }

  private mediaFrom(event: Event): MediaElementLike | null {
    const target = event.target;
    if (target instanceof HTMLElement && 'currentTime' in target && 'duration' in target) {
      return target as MediaElementLike;
    }
    return null;
  }

  private markAsCompleted(): void {
    if (this.completed || Date.now() < this.retryAfter) return;
    this.completed = true;

    this.lessonService.completeSectionProgress(this.sectionId()).subscribe({
      next: () => this.sectionCompleted.emit(),
      error: (err) => {
        // Allow a retry, but not on every time-update tick.
        this.completed = false;
        this.retryAfter = Date.now() + VideoJsPlayerComponent.RETRY_COOLDOWN_MS;
        console.error('Failed to mark section as completed', err);
      },
    });
  }

  private saveProgressOnUnload(): void {
    if (this.completed || this.lastTime <= 0) return;
    this.lessonService.saveSectionProgressOnUnload(this.sectionId(), this.lastTime);
  }

  public ngOnDestroy(): void {
    window.removeEventListener('pagehide', this.handlePageHide);
    window.removeEventListener('blur', this.handleWindowBlur);
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    // Never leave the player stuck at 2x when the route changes mid-hold.
    this.clearHoldTimer();
    this.stopBoost();

    // Leaving mid-section via in-app navigation or switching sections.
    // Uses lastTime (tracked on time-update) rather than reading the element,
    // which may already be torn down at this point.
    if (!this.completed && this.lastTime > 0) {
      this.lessonService.saveSectionProgress(this.sectionId(), this.lastTime).subscribe();
    }
  }
}
