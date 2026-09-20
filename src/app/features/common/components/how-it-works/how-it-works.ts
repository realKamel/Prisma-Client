import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  bootstrapBook,
  bootstrapCardText,
  bootstrapCreditCard,
  bootstrapPencil,
  bootstrapTrophy,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import {
  contentEntranceAnimate,
  contentEntranceInitial,
  contentEntranceTransition,
} from '../../../../core/animations/motion.animations';

@Component({
  selector: 'app-how-it-works',
  imports: [NgIcon, NgmMotionDirective],
  viewProviders: [
    provideIcons({
      bootstrapPencil,
      bootstrapBook,
      bootstrapCreditCard,
      bootstrapTrophy,
      bootstrapCardText,
    }),
  ],
  templateUrl: './how-it-works.html',
  providers: [DecimalPipe],
})
export class HowItWorksComponent {
  private readonly numberPipe = inject(DecimalPipe);

  protected readonly entranceInitial = contentEntranceInitial;
  protected readonly entranceVisible = contentEntranceAnimate;
  protected readonly entranceTransition = contentEntranceTransition;
  /** `once: false` keeps the whileInView gesture live so blocks animate back out. */
  protected readonly viewport = { once: false, amount: 0.2 } as const;

  // FIXME: should make appears in locale
  protected readonly steps = [
    {
      num: this.numberPipe.transform(1),
      emoji: 'bootstrapCardText',
      title: 'سجّل مجاناً',
      desc: 'أنشئ حساب في دقيقتين',
    },
    {
      num: this.numberPipe.transform(2),
      emoji: 'bootstrapBook',
      title: 'اختار المدرس',
      desc: 'شوف المدرسين المتاحين واختار',
    },
    {
      num: this.numberPipe.transform(3),
      emoji: 'bootstrapPencil',
      title: 'اختار الدرس',
      desc: 'شوف الدروس المتاحة واختار اللي  محتاجه',
    },
    {
      num: this.numberPipe.transform(4),
      emoji: 'bootstrapCreditCard',
      title: 'افتح المحتوى',
      desc: 'ادفع أونلاين أو استخدم كود الاشتراك',
    },
    {
      num: this.numberPipe.transform(5),
      emoji: 'bootstrapTrophy',
      title: 'تابع التقدم',
      desc: 'تقارير أسبوعية وشوف مسار تقدمك',
    },
  ];
}
