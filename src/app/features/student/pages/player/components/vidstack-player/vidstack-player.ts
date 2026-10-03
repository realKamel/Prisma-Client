import {
  afterNextRender,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  inject,
  input,
  OnDestroy,
  OnInit,
  output,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';

import { MediaTimeUpdateEvent } from 'vidstack';
import 'vidstack/icons';
import 'vidstack/player';
import 'vidstack/player/layouts/default';
import 'vidstack/player/ui';
import { LessonService } from '../../../../../../core/Services/lesson.service';

type PlayerElement = HTMLElement & { currentTime: number; duration: number };

/**
 * One instance == one section. The parent renders this inside an @for keyed by
 * sectionId, so switching sections destroys this component (ngOnDestroy saves
 * the resume point) and creates a fresh one (ngOnInit starts progress, the
 * can-play handler resumes). No per-section reset logic needed here.
 */
@Component({
  selector: 'app-vidstack-player',
  templateUrl: './vidstack-player.html',
  styleUrl: './vidstack-player.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})
export class VidstackPlayerComponent implements OnInit, OnDestroy {
  public readonly videoUrl = input.required<string>();
  public readonly sectionId = input.required<number>();
  public readonly lessonId = input<number>();
  public readonly savedProgress = input<number>(0);
  public readonly alreadyCompleted = input<boolean>(false);
  public readonly thumbnailsUrl = input<string>();
  public readonly posterUrl = input<string>();
  public readonly lessonTitle = input<string>('');

  public readonly sectionCompleted = output<void>();

  private readonly playerRef = viewChild<ElementRef<HTMLElement>>('player');
  private readonly lessonService = inject(LessonService);

  // Counts as "finished" once this many seconds (or fewer) remain. Also fires
  // right after a seek into that window, since it's checked on every time-update.
  private static readonly COMPLETION_THRESHOLD_SECONDS = 10;
  private static readonly RETRY_COOLDOWN_MS = 10_000;

  private player: PlayerElement | null = null;
  private lastTime = 0;
  private completed = false;
  private resumed = false;
  private retryAfter = 0;

  protected readonly handleCanPlay = (): void => {
    if (this.resumed || !this.player) return;
    this.resumed = true;

    const progress = this.savedProgress();
    if (!this.alreadyCompleted() && progress > 0) {
      this.player.currentTime = progress;
    }
  };

  protected readonly handleTimeUpdate = (e: Event): void => {
    const { currentTime } = (e as MediaTimeUpdateEvent).detail;
    this.lastTime = currentTime;

    if (this.completed || !this.player) return;
    const duration = this.player.duration;
    if (!(duration > 0)) return;

    // min(): a video shorter than 2x the threshold must not complete instantly.
    const threshold = Math.min(VidstackPlayerComponent.COMPLETION_THRESHOLD_SECONDS, duration / 2);
    if (duration - currentTime <= threshold) {
      this.markAsCompleted();
    }
  };

  protected readonly handleEnded = (): void => this.markAsCompleted();
  private readonly handlePageHide = (): void => this.saveProgressOnUnload();

  constructor() {
    // The media-player element exists only after the first render.
    afterNextRender(() => {
      const el = this.playerRef()?.nativeElement as PlayerElement | undefined;
      if (!el) return;

      this.player = el;
      // Real tab close / refresh — ngOnDestroy does not run in that case.
      window.addEventListener('pagehide', this.handlePageHide);
    });
  }

  public ngOnInit(): void {
    this.completed = this.alreadyCompleted();
    if (!this.completed) {
      // "Start" request — idempotent on the backend.
      this.lessonService.startSectionProgress(this.sectionId()).subscribe();
    }
  }

  private markAsCompleted(): void {
    if (this.completed || Date.now() < this.retryAfter) return;
    this.completed = true;

    this.lessonService.completeSectionProgress(this.sectionId()).subscribe({
      next: () => this.sectionCompleted.emit(),
      error: (err) => {
        // Allow a retry, but not on every time-update tick.
        this.completed = false;
        this.retryAfter = Date.now() + VidstackPlayerComponent.RETRY_COOLDOWN_MS;
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
