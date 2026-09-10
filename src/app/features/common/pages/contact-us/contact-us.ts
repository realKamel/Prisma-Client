import { Component, DestroyRef, inject, signal } from '@angular/core';

import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  bootstrapBuilding,
  bootstrapCheckCircleFill,
  bootstrapEnvelope,
  bootstrapExclamationTriangleFill,
  bootstrapPeopleFill,
  bootstrapSendFill,
  bootstrapTelephone,
  bootstrapWrenchAdjustable,
} from '@ng-icons/bootstrap-icons';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import {
  cardEntranceTransition,
  pageEntranceTransition,
  stateSwapTransition,
} from '../../../../core/animations/motion.animations';

@Component({
  selector: 'app-contact-us',
  imports: [ReactiveFormsModule, NgIcon, NgmMotionDirective],
  templateUrl: './contact-us.html',
  styleUrls: ['./contact-us.css'],
  viewProviders: [
    provideIcons({
      bootstrapBuilding,
      bootstrapCheckCircleFill,
      bootstrapEnvelope,
      bootstrapExclamationTriangleFill,
      bootstrapPeopleFill,
      bootstrapSendFill,
      bootstrapTelephone,
      bootstrapWrenchAdjustable,
    }),
  ],
})
export class ContactUsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly timers: ReturnType<typeof setTimeout>[] = [];

  protected readonly sent = signal(false);
  protected readonly loading = signal(false);
  protected readonly pageTransition = pageEntranceTransition;
  protected readonly cardTransition = cardEntranceTransition;
  protected readonly stateTransition = stateSwapTransition;
  protected readonly infiniteRepeat = Infinity;

  /** البريد الإلكتروني هو وسيلة التواصل الوحيدة المتاحة حالياً */
  readonly platformEmail = 'priismapro@gmail.com';

  /** قنوات الدعم التي لا تزال قيد الإنشاء */
  // readonly underConstruction = ['مكتب الدعم', 'الخط الساخن', 'الدردشة المباشرة', 'المقر الرئيسي'];
  readonly underConstruction = ['مكتب الدعم', 'الدردشة المباشرة'];

  subjects = [
    'استفسار عام',
    'مشكلة تقنية في المنصة',
    'اقتراح تحسين',
    'طلب الانضمام للمنصة',
    'بلاغ',
    'أخرى',
  ];

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    phone: [''],
    subject: [''],
    message: ['', Validators.required],
  });

  constructor() {
    this.destroyRef.onDestroy(() => this.timers.forEach(clearTimeout));
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, phone, subject, message } = this.form.value;
    const body = [
      `الاسم: ${name}`,
      phone ? `رقم الجوال: ${phone}` : '',
      `الموضوع: ${subject || 'عام'}`,
      '',
      message,
    ]
      .filter(Boolean)
      .join('\n');
    const mailto = `mailto:${this.platformEmail}?subject=${encodeURIComponent(
      `[تواصل مع المنصة] ${subject || name}`,
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    this.loading.set(true);
    this.timers.push(
      setTimeout(() => {
        this.loading.set(false);
        this.sent.set(true);
      }, 600),
    );
  }

  fieldInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!(c && c.invalid && c.touched);
  }
}
