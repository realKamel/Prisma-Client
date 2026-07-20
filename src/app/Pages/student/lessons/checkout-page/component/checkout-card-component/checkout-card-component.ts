import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LessonContextComponent } from "../lesson-context-component/lesson-context-component";
import { LessonService } from '../../../../../../core/Services/lesson.service';
import { PaymentService } from '../../../../../../core/Services/payment.service';
import { AuthStore } from '../../../../../../core/stores/user-store/user-store';

@Component({
  selector: 'app-checkout-card',
  standalone: true,
  imports: [CommonModule, RouterLink, LessonContextComponent],
  templateUrl: './checkout-card-component.html'
})
export class CheckoutCardComponent implements OnInit {
  private lessonService = inject(LessonService);
  private paymentService = inject(PaymentService);
  private cdr = inject(ChangeDetectorRef);
  private authStore = inject(AuthStore);

  public isLoading = true;
  public errorMessage = '';

  get lesson() {
    return this.lessonService.currentLesson;
  }

  ngOnInit(): void {
    if (!this.lessonService.currentLesson) {
      const stored = sessionStorage.getItem('currentLesson');
      if (stored) {
        try { this.lessonService.currentLesson = JSON.parse(stored); } catch { }
      }
    }
    this.initiatePayment();
  }

  private initiatePayment(): void {
    const lesson = this.lessonService.currentLesson;
    const user = this.authStore.user();

    this.paymentService.initiatePayment({
      amountCents: lesson?.price ? lesson.price * 100 : 5000,
      email: user?.email ?? 'NA',
      firstName: user?.firstName ?? 'NA',
      lastName: user?.secondName ?? 'NA',
      method: 0,
      studentId: user?.id ?? '',
      lessonId: lesson?.id ?? 0
    }).subscribe({
      next: ({ clientSecret, publicKey }) => {
        window.location.href = `https://accept.paymob.com/unifiedcheckout/?publicKey=${publicKey}&clientSecret=${clientSecret}`;
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'حصل خطأ، حاول تاني';
        this.cdr.markForCheck();
      }
    });
  }

  retry(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();
    this.initiatePayment();
  }
}