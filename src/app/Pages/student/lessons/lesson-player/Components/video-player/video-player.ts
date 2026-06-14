import { Component, Input, ViewChild, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-player.html'
})
export class VideoPlayer implements OnChanges {
  // استقبال بيانات الفيديو ديناميكيًا من المكون الأب (LessonPlayer)
  @Input() url!: string;
  @Input() poster!: string;
  @Input() title: string = 'عنوان الدرس';
  @Input() category: string = 'التصنيف الرئيسي';
  @Input() durationLabel: string = '٤٥ دقيقة';

  // الإمساك بعنصر الـ <video> من الـ HTML برمجيًا
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;

  isPlaying: boolean = false;
  isMuted: boolean = false;
  currentSpeed: string = '1.0x';

  // رصد التغييرات: عند انتقال الطالب لدرس آخر، نقوم بإعادة تحميل الفيديو الجديد تلقائيًا
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['url'] && !changes['url'].firstChange) {
      this.isPlaying = false;
      setTimeout(() => {
        if (this.videoElement?.nativeElement) {
          this.videoElement.nativeElement.load();
        }
      }, 50);
    }
  }

  togglePlay(): void {
    const video = this.videoElement.nativeElement;
    if (this.isPlaying) {
      video.pause();
    } else {
      video.play().catch(err => console.log("Video play interrupted:", err));
    }
    this.isPlaying = !this.isPlaying;
  }

  toggleMute(): void {
    const video = this.videoElement.nativeElement;
    this.isMuted = !this.isMuted;
    video.muted = this.isMuted;
  }

  changeSpeed(event: Event): void {
    const selectEl = event.target as HTMLSelectElement;
    this.currentSpeed = selectEl.value;
    
    // تحويل القيمة النصية مثل '1.5x' إلى رقم '1.5' لتطبيقه على المشغل
    const speedNumber = parseFloat(this.currentSpeed.replace('x', ''));
    this.videoElement.nativeElement.playbackRate = speedNumber;
  }

  // تحديث حالة التشغيل تلقائيًا إذا ضغط المستخدم على الفيديو نفسه بدلاً من الأزرار
  onVideoPlayStateChange(isPlayingState: boolean): void {
    this.isPlaying = isPlayingState;
  }
}