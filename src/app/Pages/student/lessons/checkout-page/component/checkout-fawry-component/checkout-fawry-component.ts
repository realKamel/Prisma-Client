import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LessonContextComponent } from '../lesson-context-component/lesson-context-component';
import { LessonService } from '../../../../../../core/Services/lesson.service';
import { DecimalPipe } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  bootstrapCheckCircleFill,
  bootstrapCheckLg,
  bootstrapChevronRight,
  bootstrapClock,
  bootstrapCopy,
  bootstrapPhone,
  bootstrapShieldCheck,
  bootstrapShop,
} from '@ng-icons/bootstrap-icons';

@Component({
  selector: 'app-checkout-fawry',
  imports: [LessonContextComponent, RouterLink, DecimalPipe, NgIcon],
  templateUrl: './checkout-fawry-component.html',
  viewProviders: [
    provideIcons({
      bootstrapCheckCircleFill,
      bootstrapCheckLg,
      bootstrapCopy,
      bootstrapClock,
      bootstrapPhone,
      bootstrapShop,
      bootstrapShieldCheck,
      bootstrapChevronRight,
    }),
  ],
  providers: [DecimalPipe],
})
export class CheckoutFawryComponent implements OnInit {
  private readonly lessonService = inject(LessonService);
  private readonly numberPipe = inject(DecimalPipe);

  // Dynamic Lesson State Mirroring
  get lesson() {
    return this.lessonService.currentLesson;
  }

  // Core Fawry & UI Signals
  readonly fawryCode = signal('');
  readonly fawryCodeDisplay = signal('');
  readonly isCopied = signal(false);

  // Countdown & Timing Signals
  readonly expiryTime = signal('');
  readonly countdown = signal('');
  readonly isUrgent = signal(false);
  private readonly timerSecs = signal(12 * 60 * 60);
  private readonly startTimer = signal(false);

  // Post-Payment Success Signals
  readonly paymentSuccess = signal(false);
  readonly paidAmount = signal(0);
  readonly validUntil = signal('');

  constructor() {
    // Reactive Countdown Loop Strategy
    effect((onCleanup) => {
      if (!this.startTimer() || this.paymentSuccess()) return;

      const interval = setInterval(() => {
        this.timerSecs.update((seconds) => {
          if (seconds <= 0) {
            clearInterval(interval);
            return 0;
          }

          const current = seconds - 1;
          const h = Math.floor(current / 3600);
          const m = Math.floor((current % 3600) / 60);
          const s = current % 60;

          this.countdown.set(
            `${this.numberPipe.transform(this.pad(h))}:${this.numberPipe.transform(this.pad(m))}:${this.numberPipe.transform(this.pad(s))}`,
          );
          this.isUrgent.set(current < 3600);

          return current;
        });
      }, 1000);

      onCleanup(() => clearInterval(interval));
    });

    // Reactive Temporary State Reset (Copy Code Feedback)
    effect((onCleanup) => {
      if (this.isCopied()) {
        const timeout = setTimeout(() => this.isCopied.set(false), 2200);
        onCleanup(() => clearTimeout(timeout));
      }
    });
  }

  ngOnInit(): void {
    if (!this.lessonService.currentLesson) {
      const stored = sessionStorage.getItem('currentLesson');
      if (stored) {
        try {
          this.lessonService.currentLesson = JSON.parse(stored);
        } catch {}
      }
    }

    this.generateCode();
    this.setExpiryLabel();

    // Kick off the countdown loop implicitly
    this.tickInitial();
    this.startTimer.set(true);
  }
  private pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  // ── Business Logic ──────────────────────────────────────────────────────────
  private generateCode(): void {
    const rawCode = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('');
    this.fawryCode.set(rawCode);

    const formatted = rawCode.replace(/(\d{4})(\d{4})(\d{1})/, '$1 $2 $3');
    this.fawryCodeDisplay.set(formatted.replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d]));
  }

  private setExpiryLabel(): void {
    const exp = new Date(Date.now() + 12 * 60 * 60 * 1000);
    const h = exp.getHours();
    const m = this.pad(exp.getMinutes());
    const ampm = h >= 12 ? 'م' : 'ص';
    const h12 = h % 12 || 12;
    this.expiryTime.set(
      `${this.numberPipe.transform(h12)}:${this.numberPipe.transform(m)} ${ampm}`,
    );
  }

  private tickInitial(): void {
    const secs = this.timerSecs();
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    this.countdown.set(
      `${this.numberPipe.transform(this.pad(h))}:${this.numberPipe.transform(this.pad(m))}:${this.numberPipe.transform(this.pad(s))}`,
    );
  }

  private setValidUntil(): void {
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
    const d = new Date();
    d.setDate(d.getDate() + 30);
    this.validUntil.set(
      `${this.numberPipe.transform(d.getDate())} ${months[d.getMonth()]} ${this.numberPipe.transform(d.getFullYear())}`,
    );
  }

  // ── Component View Actions ──────────────────────────────────────────────────
  copyCode(): void {
    navigator.clipboard.writeText(this.fawryCode()).catch(() => {});
    this.isCopied.set(true);
  }

  checkPayment(): void {
    // TODO: Replace with your actual service stream subscription pipeline
    this.onPaymentConfirmed(this.lesson?.price ?? 0);
  }

  private onPaymentConfirmed(amount: number): void {
    this.paidAmount.set(amount);
    this.setValidUntil();
    this.paymentSuccess.set(true);
    this.startTimer.set(false); // Disables the effect interval chain clean
  }
}
