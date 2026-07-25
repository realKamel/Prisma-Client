import { Component, OnInit, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { PaymentMethodComponent } from './component/payment-method-component/payment-method-component';
import { LessonContextComponent } from './component/lesson-context-component/lesson-context-component';
import { LessonResponse } from '../../../../../core/Models/lesson.model';
import { LessonService } from '../../../../../core/Services/lesson.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapArrowLeft, bootstrapCarFront, bootstrapWallet2 } from '@ng-icons/bootstrap-icons';

@Component({
  selector: 'app-checkout-page',
  imports: [RouterLink, PaymentMethodComponent, LessonContextComponent, NgIcon],
  templateUrl: './checkout-page.html',
  viewProviders: [
    provideIcons({
      bootstrapArrowLeft,
      bootstrapWallet2,
      bootstrapCarFront,
    }),
  ],
})
export class CheckoutPageComponent implements OnInit {
  private lessonService = inject(LessonService);
  private router = inject(Router);

  lesson: LessonResponse | null = null;
  selectedMethod = 'card';

  methods = [
    // {
    //   id: 'fawry',
    //   name: 'ادفع بفوري أونلاين',
    //   icon: 'bootstrapCarFront',
    //   isFawry: true,
    //   badge: 'الأسرع',
    //   desc: 'ادفع بأمان عن طريق فوري وافتح الدرس فوراً بعد الدفع',
    //   features: ['دفع آمن ومشفر ١٠٠٪', 'الدرس بيتفتحلك على طول', 'إيصال إلكتروني فوري'],
    // },
    {
      id: 'card',
      name: 'بطاقة بنكية',
      icon: 'bootstrapWallet2',
      isFawry: false,
      badge: 'فيزا · ماستر',
      desc: 'ادفع مباشرة ببطاقتك الائتمانية أو المدينة وافتح الدرس على طول',
      features: ['فيزا، ماستر وميزة', 'دفع آمن ومشفر ١٠٠٪', 'الدرس بيتفتحلك على طول'],
    },
  ];
  readonly id = input.required<string>();

  ngOnInit(): void {
    if (!this.lessonService.currentLesson) {
      const stored = sessionStorage.getItem('currentLesson');
      if (stored) this.lessonService.currentLesson = JSON.parse(stored);
    }
    if (this.lessonService.currentLesson) {
      this.lesson = this.lessonService.currentLesson;
    } else {
      this.lessonService.getLessonDetails(this.id()).subscribe({
        next: () => {
          this.lesson = this.lessonService.currentLesson;
        },
      });
    }
  }

  handleMethodSelection(methodId: string): void {
    this.selectedMethod = methodId;
  }

  continue() {
    if (this.selectedMethod === 'card') {
      this.router.navigate(['/lessons', this.id(), 'checkout', 'card']);
    } else {
      this.router.navigate(['/lessons', this.id(), 'checkout', 'fawry']);
    }
  }
}
