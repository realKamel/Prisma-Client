import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  input,
  OnInit,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';

import 'vidstack/player';
import 'vidstack/player/layouts/default';
import 'vidstack/player/ui';
import 'vidstack/icons';
import { MediaTimeUpdateEvent } from 'vidstack/types/vidstack-hVlf6lRD.js';

@Component({
  selector: 'app-vidstack-player',
  imports: [],
  templateUrl: './vidstack-player.html',
  styleUrl: './vidstack-player.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})
export class VidstackPlayer implements OnInit {
  public videoUrl = input.required<string>();

  public thumbnailsUrl = input<string>();

  public posterUrl = input<string>();

  public lessonId = input();

  public playerRef = viewChild<ElementRef>('playerRef');

  // @Input() bunnyVideoId!: string; // The GUID from Bunny Stream
  // @Input() bunnyLibraryId!: string;

  public savedProgress = input<number>(0); // seconds, from your backend

  ngOnInit() {
    // Resume from saved progress after player is ready
    setTimeout(() => {
      const player = this.playerRef()?.nativeElement;
      if (player && this.savedProgress() > 0) {
        player.currentTime = this.savedProgress();
      }
    }, 500);
  }

  onTimeUpdate(e: any) {
    const event = e as MediaTimeUpdateEvent;
    const currentTime = event.detail.currentTime;
    // Throttle: save every 10 seconds
    if (Math.floor(currentTime) % 10 === 0) {
      this.saveProgress(currentTime);
    }
  }
  onEnded() {
    this.markLessonComplete();
  }
  private saveProgress(seconds: number) {
    // Call your .NET API
    // this.progressService.save(this.lessonId, seconds).subscribe();
  }
  private markLessonComplete() {
    // POST /api/lessons/{id}/complete
  }
  ngOnDestroy() {
    // Save final position on navigate away
    const time = this.playerRef()?.nativeElement?.currentTime;
    if (time) this.saveProgress(time);
  }
}
