import { Component, inject, signal } from '@angular/core';

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

@Component({
  selector: 'app-contact-us',
  imports: [ReactiveFormsModule, NgIcon],
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
  private fb = inject(FormBuilder);

  protected readonly sent = signal(false);
  protected readonly loading = signal(false);

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
    setTimeout(() => {
      this.loading.set(false);
      this.sent.set(true);
    }, 600);
  }

  fieldInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!(c && c.invalid && c.touched);
  }
}
