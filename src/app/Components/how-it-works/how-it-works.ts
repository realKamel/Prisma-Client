import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  bootstrapBook,
  bootstrapCreditCard,
  bootstrapPencil,
  bootstrapTrophy,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';

@Component({
  selector: 'app-how-it-works',
  imports: [NgIcon],
  viewProviders: [
    provideIcons({
      bootstrapPencil,
      bootstrapBook,
      bootstrapCreditCard,
      bootstrapTrophy,
    }),
  ],
  templateUrl: './how-it-works.html',
  providers: [DecimalPipe],
})
export class HowItWorks {
  private readonly numberPipe = inject(DecimalPipe);
  // FIXME: should make appears in locale
  steps = [
    {
      num: this.numberPipe.transform(1),
      emoji: 'bootstrapPencil',
      title: 'سجّل مجاناً',
      desc: 'أنشئ حساب ابنك في دقيقتين بدون بطاقة',
    },
    {
      num: this.numberPipe.transform(2),
      emoji: 'bootstrapBook',
      title: 'اختار الدرس',
      desc: 'شوف الدروس المتاحة واختار اللي ابنك محتاجه',
    },
    {
      num: this.numberPipe.transform(3),
      emoji: 'bootstrapCreditCard',
      title: 'افتح المحتوى',
      desc: 'ادفع أونلاين أو استخدم كود الاشتراك',
    },
    {
      num: this.numberPipe.transform(4),
      emoji: 'bootstrapTrophy',
      title: 'تابع التقدم',
      desc: 'تقارير أسبوعية وشوف تحسّن ابنك بنفسك',
    },
  ];
}
