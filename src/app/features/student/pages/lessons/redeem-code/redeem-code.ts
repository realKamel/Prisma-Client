import { Component, inject, signal, computed, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LessonContextComponent } from '../checkout-page/component/lesson-context-component/lesson-context-component';
import { LessonService } from '../../../../../core/Services/lesson.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { IProblemDetails } from '../../../../../core/Models/problemDetails';
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
  imports: [RouterLink, FormsModule, LessonContextComponent, NgIcon, DatePipe],
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
export class RedeemCode implements OnDestroy {
  private lessonService = inject(LessonService);
  private http = inject(HttpClient);

  // Core State Signals
  readonly cardState = signal<'entry' | 'success'>('entry');
  readonly activationCode = signal('');
  readonly isProcessing = signal<boolean>(false);
  readonly inputStatus = signal<'none' | 'valid' | 'invalid'>('none');
  readonly activeError = signal<'wrong' | 'used' | 'expired' | 'lesson' | 'year' | null>(null);
  readonly isShaking = signal<boolean>(false);
  readonly expiresAt = signal<string | Date | null>(null);

  // Computed selector mirroring shared state framework
  readonly lesson = computed(() => this.lessonService.currentLesson());

  private shakeTimer: ReturnType<typeof setTimeout> | null = null;

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
    // Clear any pending timer so rapid consecutive errors still replay the animation
    if (this.shakeTimer) clearTimeout(this.shakeTimer);
    this.isShaking.set(false);
    // Flip false -> true on the next tick so the class is re-added and the animation restarts
    setTimeout(() => {
      this.isShaking.set(true);
      this.shakeTimer = setTimeout(() => this.isShaking.set(false), 500);
    });
  }

  ngOnDestroy(): void {
    if (this.shakeTimer) clearTimeout(this.shakeTimer);
  }

  public handleUnlock(): void {
    if (this.isProcessing() || this.activationCode().trim().length < 4) return;

    const lessonId = this.lesson()?.id;
    if (!lessonId) return;

    this.isProcessing.set(true);
    this.activeError.set(null);
    this.inputStatus.set('none');

    this.http
      .post<{ enrollmentId: number; expiresAt: string }>('/api/v1/codes/redeem', {
        code: this.activationCode().trim(),
        lessonId,
      })
      .subscribe({
        next: (res) => {
          this.isProcessing.set(false);
          if (res?.expiresAt) {
            this.expiresAt.set(res.expiresAt);
            this.cardState.set('success');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        },
        error: (err: HttpErrorResponse) => {
          this.isProcessing.set(false);
          const problem = err.error as IProblemDetails | undefined;
          this.mapErrorMessage(problem?.detail ?? problem?.title ?? '');
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
    } else if (message.includes('منتهي') || message.includes('انتهت')) {
      this.activeError.set('expired');
    } else {
      this.activeError.set('wrong');
    }
  }
}
