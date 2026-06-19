import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { LessonContextComponent } from '../lesson-context-component/lesson-context-component';
import { LessonService } from '../../../../../../core/Services/lesson.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-checkout-fawry',
  standalone: true,
  imports: [LessonContextComponent, CommonModule, RouterLink],
  templateUrl: './checkout-fawry-component.html'
})
export class CheckoutFawryComponent implements OnInit, OnDestroy {
  lessonService = inject(LessonService);

  get lesson() { return this.lessonService.currentLesson; }

  fawryCode = '';
  fawryCodeDisplay = '';
  isCopied = false;

  // ── Countdown ─────────────────────────────────────────────────────────────
  expiryTime = '';
  countdown = '';
  isUrgent = false;
  private timerSecs = 12 * 60 * 60;
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  
  ngOnInit(): void {
    this.generateCode();
    this.setExpiryLabel();
    this.startCountdown();
  }

  private toAr(n: string | number): string {
    return String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);
  }
  private pad(n: number): string { return String(n).padStart(2, '0'); }


    // ── TO DO: calling from service  ─────────────────────────────────────────────────────────────

  private generateCode(): void {
    this.fawryCode = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('');
    const formatted = this.fawryCode.replace(/(\d{4})(\d{4})(\d{1})/, '$1 $2 $3');
    this.fawryCodeDisplay = formatted.replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);
  }

  private setExpiryLabel(): void {
    const exp  = new Date(Date.now() + 12 * 60 * 60 * 1000);
    const h    = exp.getHours();
    const m    = this.pad(exp.getMinutes());
    const ampm = h >= 12 ? 'م' : 'ص';
    const h12  = h % 12 || 12;
    this.expiryTime = `${this.toAr(h12)}:${this.toAr(m)} ${ampm}`;
  }

  private startCountdown(): void {
    this.tick();
    this.timerInterval = setInterval(() => this.tick(), 1000);
  }

  private tick(): void {
    if (this.timerSecs <= 0) { clearInterval(this.timerInterval!); return; }
    const h = Math.floor(this.timerSecs / 3600);
    const m = Math.floor((this.timerSecs % 3600) / 60);
    const s = this.timerSecs % 60;
    this.countdown = `${this.toAr(this.pad(h))}:${this.toAr(this.pad(m))}:${this.toAr(this.pad(s))}`;
    this.isUrgent  = this.timerSecs < 3600;
    this.timerSecs--;
    this.cdr.detectChanges();
  }

  copyCode(): void {
    navigator.clipboard.writeText(this.fawryCode).catch(() => {});
    this.isCopied = true;
    setTimeout(() => (this.isCopied = false), 2200);
  }

  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  private cdr = inject(ChangeDetectorRef);

   
}