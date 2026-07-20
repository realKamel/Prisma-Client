import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LessonContextComponent } from '../checkout-page/component/lesson-context-component/lesson-context-component';
import { LessonService } from '../../../../core/Services/lesson.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-redeem-code',
  imports: [CommonModule, RouterLink, FormsModule, LessonContextComponent],
  templateUrl: './redeem-code.html',
})
export class RedeemCode implements OnInit {
  private lessonService = inject(LessonService);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  public cardState: 'entry' | 'success' = 'entry';
  public activationCode = '';
  public isProcessing = false;
  public inputStatus: 'none' | 'valid' | 'invalid' = 'none';
  public activeError: 'wrong' | 'used' | 'expired' | 'lesson' | 'year' | null = null;
  public isShaking = false;
  public expiryDateString = '';

  get lesson() {
    return this.lessonService.currentLesson;
  }

  ngOnInit(): void {}

  onCodeInput(): void {
    this.activeError = null;
    this.inputStatus = this.activationCode.trim().length >= 4 ? 'valid' : 'none';
  }

  clearCode(): void {
    this.activationCode = '';
    this.inputStatus = 'none';
    this.activeError = null;
  }

  private triggerShake(): void {
    this.isShaking = true;
    setTimeout(() => (this.isShaking = false), 500);
  }

  private setExpiryFromDate(date: string | Date): void {
    const months = [
      'يناير','فبراير','مارس','أبريل','مايو','يونيو',
      'يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر',
    ];
    const d = new Date(date);
    this.expiryDateString = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  public handleUnlock(): void {
    if (this.isProcessing || this.activationCode.trim().length < 4) return;

    const lessonId = this.lesson?.id;
    if (!lessonId) return;

    this.isProcessing = true;
    this.activeError = null;
    this.inputStatus = 'none';

    this.http.post<{
      succeeded: boolean;
      message: string;
      data?: { enrollmentId: number; expiresAt: string };
    }>('/api/v1/codes/redeem', {
      code: this.activationCode.trim(),
      lessonId,
    }).subscribe({
      next: (res) => {
        this.isProcessing = false;
        if (res.succeeded && res.data) {
          this.setExpiryFromDate(res.data.expiresAt);
          this.cardState = 'success';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          this.mapErrorMessage(res.message);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isProcessing = false;
        const message: string = err?.error?.message ?? '';
        this.mapErrorMessage(message);
        this.cdr.detectChanges();
      },
    });
  }

  private mapErrorMessage(message: string): void {
    this.inputStatus = 'invalid';
    this.triggerShake();

    if (message.includes('اتستخدم')) {
      this.activeError = 'used';
    } else if (message.includes('مش للدرس')) {
      this.activeError = 'lesson';
    } else if (message.includes('السنة الدراسية')) {
      this.activeError = 'year';
    } else {
      this.activeError = 'wrong';
    }
  }
}