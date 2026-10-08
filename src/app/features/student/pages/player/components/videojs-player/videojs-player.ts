import {
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  input,
  OnDestroy,
  OnInit,
  output,
  ViewEncapsulation,
} from '@angular/core';
// Registering the Video.js custom elements is a side effect of these imports:
// the player (state), the hls.js-backed media element, and every control this
// custom UI composes. The packaged `<video-skin>` is deliberately not imported:
// its controls live in a shadow root, so PiP/Cast cannot be removed from it and
// seek buttons cannot be added to it.
import { TranslatePipe } from '@ngx-translate/core';
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
import '@videojs/html/ui/seek-button';
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

  private readonly lessonService = inject(LessonService);

  // Counts as "finished" once this many seconds (or fewer) remain. Also fires
  // right after a seek into that window, since it's checked on every time-update.
  private static readonly COMPLETION_THRESHOLD_SECONDS = 10;
  private static readonly RETRY_COOLDOWN_MS = 10_000;

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

  public ngOnInit(): void {
    this.completed = this.alreadyCompleted();
    // Real tab close / refresh — ngOnDestroy does not run in that case.
    window.addEventListener('pagehide', this.handlePageHide);

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

    // Leaving mid-section via in-app navigation or switching sections.
    // Uses lastTime (tracked on time-update) rather than reading the element,
    // which may already be torn down at this point.
    if (!this.completed && this.lastTime > 0) {
      this.lessonService.saveSectionProgress(this.sectionId(), this.lastTime).subscribe();
    }
  }
}
