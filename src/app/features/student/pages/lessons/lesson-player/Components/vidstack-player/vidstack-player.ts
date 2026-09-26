import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
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
import { LessonService } from '../../../../../../../core/Services/lesson.service';

@Component({
  selector: 'app-vidstack-player',
  imports: [],
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
  public readonly thumbnailsUrl = input<string>();
  public readonly posterUrl = input<string>();
  public readonly lessonTitle = input<string>('');

  public readonly sectionCompleted = output<void>();

  public readonly playerRef = viewChild<ElementRef>('playerRef');
  public readonly lessonService = inject(LessonService);

  private progressInterval: ReturnType<typeof setInterval> | undefined;
  private completed = false;

  constructor() {
    effect(() => {
      const id = this.sectionId();
      this.completed = false; // Reset status when section changes
      this.lessonService.startSectionProgress(id).subscribe();
    });
  }

  public ngOnInit(): void {
    this.loadVidstackStyles();

    // Auto-resume from saved progress
    setTimeout(() => {
      const player = this.playerRef()?.nativeElement;
      if (player && this.savedProgress() > 0) {
        player.currentTime = this.savedProgress();
      }
    }, 500);

    // Save progress periodically every 30s
    this.progressInterval = setInterval(() => {
      const player = this.playerRef()?.nativeElement;
      if (player?.currentTime && !this.completed) {
        this.saveProgress(player.currentTime);
      }
    }, 15000);
  }

  protected onTimeUpdate(e: Event): void {
    if (this.completed) return;

    const event = e as MediaTimeUpdateEvent;
    const currentTime = event.detail.currentTime;
    const player = this.playerRef()?.nativeElement;
    const duration = player?.duration;

    // Optional: Mark as watched automatically when reaching 90%+ duration
    if (duration > 0 && currentTime / duration >= 0.9) {
      this.markAsCompleted();
    }
  }

  protected onEnded(): void {
    this.markAsCompleted();
  }

  private markAsCompleted(): void {
    if (this.completed) return;
    this.completed = true;

    this.lessonService.completeSectionProgress(this.sectionId()).subscribe({
      next: () => {
        this.sectionCompleted.emit();
      },
      error: (err) => {
        // Fallback in case backend call fails
        this.completed = false;
        console.error('Failed to mark section as completed', err);
      },
    });
  }

  private saveProgress(seconds: number): void {
    this.lessonService.saveSectionProgress(this.sectionId(), seconds).subscribe();
  }

  private loadVidstackStyles(): void {
    if (document.getElementById('vidstack-theme-styles')) return;

    ['vidstack-theme', 'vidstack-layout', 'vidstack-foundry'].forEach((name) => {
      const link = document.createElement('link');
      link.id = `${name}-styles`;
      link.rel = 'stylesheet';
      link.href = `/${name}.css`;
      document.head.appendChild(link);
    });
  }

  public ngOnDestroy(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }

    // Save current time when leaving player if not finished
    const currentTime = this.playerRef()?.nativeElement?.currentTime;
    if (currentTime && !this.completed) {
      this.saveProgress(currentTime);
    }
  }
}
