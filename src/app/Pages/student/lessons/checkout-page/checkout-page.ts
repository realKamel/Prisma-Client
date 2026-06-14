import { Component, Input, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PaymentMethodComponent } from './component/payment-method-component/payment-method-component';
import { LessonContextComponent } from './component/lesson-context-component/lesson-context-component';
import { LessonResponse } from '../../../../core/Models/lesson.model';
import { LessonService } from '../../../../core/Services/lesson.service';


@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule, RouterLink, PaymentMethodComponent, LessonContextComponent],
  templateUrl: './checkout-page.html'
})
export class CheckoutPageComponent implements OnInit {
  private lessonService = inject(LessonService);
  private router = inject(Router);

  lesson: LessonResponse | null = null;
  selectedMethod = 'fawry';

  methods = [
    {
      id: 'fawry',
      name: 'ادفع بفوري أونلاين',
      icon: 'bi-credit-card-2-front',
      isFawry: true,
      badge: 'الأسرع',
      desc: 'ادفع بأمان عن طريق فوري وافتح الدرس فوراً بعد الدفع',
      features: ['دفع آمن ومشفر ١٠٠٪', 'الدرس بيتفتحلك على طول', 'إيصال إلكتروني فوري']
    },
    {
      id: 'card',
      name: 'بطاقة بنكية',
      icon: 'bi-wallet2',
      isFawry: false,
      badge: 'فيزا · ماستر',
      desc: 'ادفع مباشرة ببطاقتك الائتمانية أو المدينة وافتح الدرس على طول',
      features: ['فيزا، ماستر وميزة', 'دفع آمن ومشفر ١٠٠٪', 'الدرس بيتفتحلك على طول']
    }
  ];
  @Input() id!: string; 

  ngOnInit(): void {
    // لو البيانات موجودة في الـ service استخدمها، لو لأ اجلبها
    if (this.lessonService.currentLesson) {
      this.lesson = this.lessonService.currentLesson;
    } else {
      this.lessonService.getLessonDetails(this.id).subscribe({
        next: () => { this.lesson = this.lessonService.currentLesson; }
      });
    }
  }

  handleMethodSelection(methodId: string): void {
    this.selectedMethod = methodId;
  }

continue() {
  if (this.selectedMethod === 'card') {
    this.router.navigate(['/checkout/card']);
  } else {
    this.router.navigate(['/checkout/fawry']);
  }
}
}