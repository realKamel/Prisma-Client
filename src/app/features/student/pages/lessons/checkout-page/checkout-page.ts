import { Component, OnInit, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { bootstrapArrowLeft, bootstrapCarFront, bootstrapWallet2 } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { LessonResponse } from '../../../../../domain/lessons/models/lesson.model';
import { LessonService } from '../../../../../domain/lessons/services/lesson.service';
import { LessonContextComponent } from './component/lesson-context-component/lesson-context-component';
import { PaymentMethodComponent } from './component/payment-method-component/payment-method-component';

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

  protected lesson: LessonResponse | null = null;
  protected selectedMethod = 'card';

  protected methods = [
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
  public readonly id = input.required<string>();

  public ngOnInit(): void {
    this.lessonService.restoreFromSession();
    if (this.lessonService.currentLesson()) {
      this.lesson = this.lessonService.currentLesson();
    } else {
      this.lessonService.getLessonDetails(this.id()).subscribe({
        next: () => {
          this.lesson = this.lessonService.currentLesson();
        },
      });
    }
  }

  protected handleMethodSelection(methodId: string): void {
    this.selectedMethod = methodId;
  }

  protected continue() {
    if (this.selectedMethod === 'card') {
      void this.router.navigate(['/lessons', this.id(), 'checkout', 'card']);
    } else {
      void this.router.navigate(['/lessons', this.id(), 'checkout', 'fawry']);
    }
  }
}
