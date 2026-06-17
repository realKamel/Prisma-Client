import { Component, Input, ViewChild, ElementRef, OnChanges, SimpleChanges, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Hls from 'hls.js';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-player.html'
})
export class VideoPlayer implements OnChanges, OnDestroy, AfterViewInit {
  @Input() url!: string;
  @Input() poster!: string;
  @Input() title: string = '';
  @Input() category: string = '';

  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;

  isPlaying = false;
  isMuted = false;
  currentTime = 0;
  duration = 0;
  progressPercent = 0;
  currentTimeLabel = '00:00';
  durationLabel = '00:00';
  volume = 100;

  private hls: Hls | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['url'] && this.videoElement) {
      this.isPlaying = false;
      this.currentTime = 0;
      this.progressPercent = 0;
      this.currentTimeLabel = '00:00';
      setTimeout(() => this.initPlayer(), 50);
    }
  }

  ngOnDestroy(): void {
    this.destroyHls();
  }
  ngAfterViewInit(): void {
    if (this.url) {
      this.initPlayer();
    }
  }
  // called from template via (loadedmetadata)
  onMetadataLoaded(): void {
    const video = this.videoElement.nativeElement;
    this.duration = video.duration;
    this.durationLabel = this.formatTime(video.duration);
  }

  initPlayer(): void {
    const video = this.videoElement.nativeElement;
    this.destroyHls();

    if (!this.url) return;

    const isHls = this.url.includes('.m3u8');

    if (isHls && Hls.isSupported()) {
      this.hls = new Hls();
      this.hls.loadSource(this.url);
      this.hls.attachMedia(video);
    } else {
      // native HLS (Safari) or plain MP4
      video.src = this.url;
      video.load();
    }
  }

  private destroyHls(): void {
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
  }

  onTimeUpdate(): void {
    const video = this.videoElement.nativeElement;
    this.currentTime = video.currentTime;
    this.progressPercent = this.duration ? (video.currentTime / this.duration) * 100 : 0;
    this.currentTimeLabel = this.formatTime(video.currentTime);
  }

  onVideoEnded(): void {
    this.isPlaying = false;
    this.progressPercent = 100;
  }

  togglePlay(): void {
    const video = this.videoElement.nativeElement;
    if (this.isPlaying) {
      video.pause();
    } else {
      video.play().catch(err => console.log('Play interrupted:', err));
    }
  }

  onVideoPlayStateChange(playing: boolean): void {
    this.isPlaying = playing;
  }

  toggleMute(): void {
    const video = this.videoElement.nativeElement;
    this.isMuted = !this.isMuted;
    video.muted = this.isMuted;
  }

  onVolumeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.volume = +input.value;
    const video = this.videoElement.nativeElement;
    video.volume = this.volume / 100;
    this.isMuted = this.volume === 0;
  }

  onSeek(event: MouseEvent): void {
    const bar = event.currentTarget as HTMLElement;
    const rect = bar.getBoundingClientRect();
    const clickX = rect.right - event.clientX;
    const ratio = Math.min(Math.max(clickX / rect.width, 0), 1);
    this.videoElement.nativeElement.currentTime = ratio * this.duration;
  }

  skipBackward(): void {
    this.videoElement.nativeElement.currentTime -= 10;
  }

  changeSpeed(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.videoElement.nativeElement.playbackRate = parseFloat(select.value);
  }

  toggleFullscreen(): void {
    const video = this.videoElement.nativeElement;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  }

  private formatTime(seconds: number): string {
    if (isNaN(seconds)) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
}