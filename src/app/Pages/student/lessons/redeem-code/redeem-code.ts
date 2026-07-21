import { Component, OnInit, inject, signal, computed, model } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LessonContextComponent } from '../checkout-page/component/lesson-context-component/lesson-context-component';
import { LessonService } from '../../../../core/Services/lesson.service';
import { HttpClient } from '@angular/common/http';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  bootstrapArrowLeftShort,
  bootstrapCalendarCheckFill,
  bootstrapChevronRight,
  bootstrapCreditCard2FrontFill,
  bootstrapPatchCheckFill,
  bootstrapTagFill,
  bootstrapXLg,
} from '@ng-icons/bootstrap-icons';

@Component({
  selector: 'app-redeem-code',
  imports: [RouterLink, FormsModule, LessonContextComponent, NgIcon],
  templateUrl: './redeem-code.html',
  viewProviders: [
    provideIcons({
      bootstrapXLg,
      bootstrapTagFill,
      bootstrapCreditCard2FrontFill,
      bootstrapPatchCheckFill,
      bootstrapCalendarCheckFill,
      bootstrapArrowLeftShort,
      bootstrapChevronRight,
    }),
  ],
})
export class RedeemCode implements OnInit {
  private lessonService = inject(LessonService);
  private http = inject(HttpClient);

  // Core State Signals
  readonly cardState = signal<'entry' | 'success'>('entry');
  readonly activationCode = signal('');
  readonly isProcessing = signal<boolean>(false);
  readonly inputStatus = signal<'none' | 'valid' | 'invalid'>('none');
  readonly activeError = signal<'wrong' | 'used' | 'expired' | 'lesson' | 'year' | null>(null);
  readonly isShaking = signal<boolean>(false);
  readonly expiryDateString = signal<string>('');

  // Computed selector mirroring shared state framework
  readonly lesson = computed(() => this.lessonService.currentLesson);

  ngOnInit(): void {}

  onCodeInput(): void {
    this.activeError.set(null);
    this.inputStatus.set(this.activationCode().trim().length >= 4 ? 'valid' : 'none');
  }

  clearCode(): void {
    this.activationCode.set('');
    this.inputStatus.set('none');
    this.activeError.set(null);
  }

  private triggerShake(): void {
    this.isShaking.set(true);
    setTimeout(() => this.isShaking.set(false), 500);
  }

  private setExpiryFromDate(date: string | Date): void {
    const months = [
      'يناير',
      'فبراير',
      'مارس',
      'أبريل',
      'مايو',
      'يونيو',
      'يوليو',
      'أغسطس',
      'سبتمبر',
      'أكتوبر',
      'نوفمبر',
      'ديسمبر',
    ];
    const d = new Date(date);
    this.expiryDateString.set(`${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`);
  }

  public handleUnlock(): void {
    if (this.isProcessing() || this.activationCode().trim().length < 4) return;

    const lessonId = this.lesson()?.id;
    if (!lessonId) return;

    this.isProcessing.set(true);
    this.activeError.set(null);
    this.inputStatus.set('none');

    this.http
      .post<{
        succeeded: boolean;
        message: string;
        data?: { enrollmentId: number; expiresAt: string };
      }>('/api/v1/codes/redeem', {
        code: this.activationCode().trim(),
        lessonId,
      })
      .subscribe({
        next: (res) => {
          this.isProcessing.set(false);
          if (res.succeeded && res.data) {
            this.setExpiryFromDate(res.data.expiresAt);
            this.cardState.set('success');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            this.mapErrorMessage(res.message);
          }
        },
        error: (err) => {
          this.isProcessing.set(false);
          const message: string = err?.error?.message ?? '';
          this.mapErrorMessage(message);
        },
      });
  }

  private mapErrorMessage(message: string): void {
    this.inputStatus.set('invalid');
    this.triggerShake();

    if (message.includes('اتستخدم')) {
      this.activeError.set('used');
    } else if (message.includes('مش للدرس')) {
      this.activeError.set('lesson');
    } else if (message.includes('السنة الدراسية')) {
      this.activeError.set('year');
    } else {
      this.activeError.set('wrong');
    }
  }
}
