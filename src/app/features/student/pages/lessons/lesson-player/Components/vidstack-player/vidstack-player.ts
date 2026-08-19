import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  ElementRef,
  inject,
  input,
  OnInit,
  viewChild,
  ViewEncapsulation,
  output,
  OnDestroy,
} from '@angular/core';

import 'vidstack/player';
import 'vidstack/player/layouts/default';
import 'vidstack/player/ui';
import 'vidstack/icons';
import { MediaTimeUpdateEvent } from 'vidstack/types/vidstack-hVlf6lRD.js';
import { LessonService } from '../../../../../../../core/Services/lesson.service';

@Component({
  selector: 'app-vidstack-player',
  imports: [],
  templateUrl: './vidstack-player.html',
  styleUrl: './vidstack-player.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})
export class VidstackPlayer implements OnInit, OnDestroy {
  public videoUrl = input.required<string>();
  public sectionId = input.required<number>();
  private lessonService = inject(LessonService);
  private progressInterval: any;
  private duration = 0;
  public thumbnailsUrl = input<string>();
  readonly sectionCompleted = output<void>();
  public posterUrl = input<string>();
  readonly lessonTitle = input<string>('');
  public lessonId = input();

  public playerRef = viewChild<ElementRef>('playerRef');
  constructor() {
    effect(() => {
      const id = this.sectionId();
      this.completed = false;
      this.lessonService.startSectionProgress(id).subscribe();
    });
  }
  // @Input() bunnyVideoId!: string; // The GUID from Bunny Stream
  // @Input() bunnyLibraryId!: string;

  public savedProgress = input<number>(0); // seconds, from your backend

  ngOnInit() {
    this.loadVidstackStyles();

    setTimeout(() => {
      const player = this.playerRef()?.nativeElement;
      if (player && this.savedProgress() > 0) {
        player.currentTime = this.savedProgress();
      }
    }, 500);

    this.progressInterval = setInterval(() => {
      const time = this.playerRef()?.nativeElement?.currentTime;
      if (time) this.saveProgress(time);
    }, 30000);
  }

  private completed = false;

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
  onTimeUpdate(e: any) {
    if (this.completed) return;

    const event = e as MediaTimeUpdateEvent;
    const currentTime = event.detail.currentTime;
    const player = this.playerRef()?.nativeElement;
    const duration = player?.duration;

    if (duration > 0 && currentTime / duration >= 0.9) {
      this.completed = true;
      this.lessonService.completeSectionProgress(this.sectionId()).subscribe({
        next: () => this.sectionCompleted.emit(),
      });
    }
  }

  onEnded() {
    if (this.completed) return;
    this.completed = true;
    this.lessonService.completeSectionProgress(this.sectionId()).subscribe({
      next: () => this.sectionCompleted.emit(),
    });
  }
  private saveProgress(seconds: number) {
    this.lessonService.saveSectionProgress(this.sectionId(), seconds).subscribe();
  }
  private markLessonComplete() {
    // POST /api/lessons/{id}/complete
  }
  ngOnDestroy() {
    clearInterval(this.progressInterval);
    const time = this.playerRef()?.nativeElement?.currentTime;
    if (time) this.saveProgress(time);
  }
}
