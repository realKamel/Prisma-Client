import { Component, inject } from '@angular/core';

import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface Experience {
  role: string;
  place: string;
  years: string;
  duration: string;
}

export interface SocialLink {
  icon: string;
  label: string;
  href: string;
}

@Component({
  selector: 'app-contact-us',

  imports: [ReactiveFormsModule],
  templateUrl: './contact-us.html',
  styleUrls: ['./contact-us.css'],
})
export class ContactUsComponent {
  private fb = inject(FormBuilder);

  sent = false;
  loading = false;

  teacher = {
    initials: 'أح',
    name: 'أحمد محمد مصطفى',
    title: 'مدرّس لغة انجليزي · المرحلة الثانوية',
    phone: '+20 1000 923 621',
    email: 'ahmed@platform.edu',
    location: 'الفيوم مصر — مدرسة الرسالة الخاصة الثانوية',
    hours: 'السبت – الخميس · 9 ص – 3 م',
    photoUrl: '', // set to an image URL to show a real photo
  };

  experiences: Experience[] = [
    {
      role: 'مدرّس لغة انجليزي',
      place: 'مدرسة الرسالة الخاصة الثانوية · الفيوم',
      years: '2019 – الآن',
      duration: '6 سنوات',
    },
    {
      role: 'مدرّس لغة انجليزية',
      place: 'معهد المستقبل التعليمي · الجيزة',
      years: '2015 – 2019',
      duration: '4 سنوات',
    },
    {
      role: 'مساعد تدريس · جامعي',
      place: 'جامعة القاهرة · كلية العلوم',
      years: '2013 – 2015',
      duration: 'سنتان',
    },
  ];

  socials: SocialLink[] = [
    { icon: 'whatsapp', label: 'واتساب', href: '#' },
    { icon: 'telegram', label: 'تيليجرام', href: '#' },
    { icon: 'youtube', label: 'يوتيوب', href: '#' },
    { icon: 'linkedin', label: 'لينكد إن', href: '#' },
  ];

  subjects = [
    'استفسار عن الحصص',
    'طلب دروس خصوصية',
    'متابعة مستوى الطالب',
    'مشكلة تقنية في المنصة',
    'أخرى',
  ];

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    phone: [''],
    subject: [''],
    message: ['', Validators.required],
  });

  get isLast(): (i: number) => boolean {
    return (i: number) => i === this.experiences.length - 1;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      this.sent = true;
    }, 1200);
  }

  fieldInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!(c && c.invalid && c.touched);
  }
}
