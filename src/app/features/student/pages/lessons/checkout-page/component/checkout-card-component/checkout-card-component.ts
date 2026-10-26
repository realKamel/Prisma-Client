import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { bootstrapChevronRight, bootstrapExclamationCircle } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { LessonService } from '../../../../../../../core/services/lesson.service';
import { PaymentService } from '../../../../../../../core/services/payment.service';
import { AuthStore } from '../../../../../../../core/stores/auth.store';
import { LessonContextComponent } from '../lesson-context-component/lesson-context-component';

@Component({
  selector: 'app-checkout-card',
  imports: [RouterLink, LessonContextComponent, NgIcon],
  templateUrl: './checkout-card-component.html',
  viewProviders: [
    provideIcons({
      bootstrapChevronRight,
      bootstrapExclamationCircle,
    }),
  ],
})
export class CheckoutCardComponent implements OnInit {
  private lessonService = inject(LessonService);
  private paymentService = inject(PaymentService);
  private authStore = inject(AuthStore);

  // Core State Signals
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string>('');

  // Computed selector mirroring internal service signal
  readonly lesson = computed(() => this.lessonService.currentLesson());

  ngOnInit(): void {
    if (!this.lessonService.currentLesson()) {
      const stored = sessionStorage.getItem('currentLesson');
      if (stored) {
        try {
          this.lessonService.setCurrentLesson(JSON.parse(stored));
        } catch {}
      }
    }
    this.initiatePayment();
  }

  private initiatePayment(): void {
    const lesson = this.lessonService.currentLesson();
    const user = this.authStore.user();

    this.paymentService
      .initiatePayment({
        amountCents: lesson?.money ? lesson.money.amount * 100 : 5000,
        email: user?.email ?? 'NA',
        firstName: user?.firstName ?? 'NA',
        lastName: user?.secondName ?? 'NA',
        method: 0,
        studentId: user?.id ?? '',
        lessonId: lesson?.id ?? 0,
      })
      .subscribe({
        next: ({ clientSecret, publicKey }) => {
          window.location.href = `https://accept.paymob.com/unifiedcheckout/?publicKey=${publicKey}&clientSecret=${clientSecret}`;
        },
        error: () => {
          this.isLoading.set(false);
          this.errorMessage.set('حصل خطأ، حاول تاني');
        },
      });
  }

  retry(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.initiatePayment();
  }
}
