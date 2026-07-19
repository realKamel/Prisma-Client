import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LessonService } from '../../../../core/Services/lesson.service';
import { BreadcrumbComponent } from './components/breadcrumb-component/breadcrumb-component';
import { ExpiredLessonCardComponent } from './components/expired-lesson-card-component/expired-lesson-card-component';
import { RenewalCardComponent } from './components/renewal-card-component/renewal-card-component';
import { AltOptionsCardComponent } from './components/alt-options-card-component/alt-options-card-component';

import {
  AltOption,
  BreadcrumbItem,
  ChapterDto,
  LessonCardData,
  RenewalPlan,
} from '../../../../core/Models/lesson-expired';

@Component({
  selector: 'app-lesson-expired',

  imports: [
    BreadcrumbComponent,
    ExpiredLessonCardComponent,
    RenewalCardComponent,
    AltOptionsCardComponent,
  ],
  templateUrl: './lesson-expired.html',
})
export class LessonExpiredComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private lessonService = inject(LessonService);

  // Core State Signals
  readonly loading = signal<boolean>(true);
  readonly error = signal<string>('');

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'الرئيسية', link: '/dashboard' },
    { label: 'دروسي', link: '/history' },
    { label: 'انتهت الصلاحية', colorClass: 'text-[var(--coral)]' },
  ];

  readonly lessonData = signal<LessonCardData>({
    subjectTag: '',
    title: '',
    description: '',
    thumbnailUrl: null,
    stats: [],
    progressPercent: 0,
    expiredDaysAgo: 0,
  });

  readonly renewalPlan = signal<RenewalPlan>({
    priceLabel: '',
    currency: 'ج',
    amount: '',
    periodLabel: '/ ٣٠ يوم',
    features: [
      'وصول كامل لجميع الفيديوهات',
      'ملفات PDF وملخصات المراجعة',
      'كويز تفاعلي مع نتيجة فورية',
      'تقدمك السابق محفوظ بالكامل',
    ],
  });

  readonly altOptions: AltOption[] = [
    {
      icon: 'bi-mortarboard',
      iconVariant: 'purple',
      name: 'تصفح دروس أخرى',
      subtitle: 'اكتشف دروسًا جديدة في مكتبتنا',
      link: '/lessons',
    },
    {
      icon: 'bi-currency-dollar',
      iconVariant: 'coral',
      name: 'طلب استرداد',
      subtitle: 'واجهت مشكلة؟ نستردّ لك المبلغ',
      link: '/refund',
    },
    {
      icon: 'bi-chat-dots',
      iconVariant: 'mint',
      name: 'تواصل مع الدعم',
      subtitle: 'فريقنا جاهز للمساعدة',
      link: '/support',
    },
  ];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.loadLesson(id);
  }

  private loadLesson(id: string) {
    this.loading.set(true);
    this.error.set('');

    this.lessonService.getExpiredLessonDetails(id).subscribe({
      next: (res) => {
        this.lessonData.set(this.mapApiToCard(res.data));
        this.renewalPlan.set(this.buildRenewalPlan(res.data));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('تعذّر تحميل بيانات الدرس. حاول مجددًا.');
        this.loading.set(false);
      },
    });
  }

  private mapApiToCard(d: any): LessonCardData {
    return {
      subjectTag: d.subject ?? '',
      title: d.title ?? '',
      description: d.description ?? '',
      thumbnailUrl: d.url ?? null,
      expiredDaysAgo: this.calcExpiredDays(d.expiredDate),
      progressPercent: d.totalprogress,
      stats: this.buildStats(d),
    };
  }

  private buildStats(d: any) {
    const videoCount = d.chaptersCount ?? d.chapters?.length ?? 0;
    const materials = d.materialsCount ?? 0;
    const duration = this.calculateDuration(d.chapters) ?? '—';
    const quizScore = d.degree;

    return [
      { icon: 'bi-camera-video', value: videoCount.toString(), label: 'فيديوهات' },
      { icon: 'bi-clock', value: duration, label: '' },
      { icon: 'bi-file-earmark-pdf', value: materials.toString(), label: 'ملفات PDF' },
      ...(quizScore !== null
        ? [
            {
              icon: 'bi-star-fill',
              value: `${Math.round(quizScore)}`,
              label: '%',
              valueColor: 'var(--star)',
            },
          ]
        : []),
    ];
  }

  calculateDuration(d: ChapterDto[]): string {
    if (!d) return '-';
    const totalSeconds = d.reduce((sum, item) => {
      const [h, m, s] = item.duration.split(':').map(Number);
      return sum + h * 3600 + m * 60 + s;
    }, 0);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0 && minutes > 0) return `${hours} ساعة ${minutes} دقيقة`;
    if (hours > 0) return `${hours} ساعة`;
    if (minutes > 0) return `${minutes} دقيقة`;
    return '-';
  }

  private buildRenewalPlan(d: any): RenewalPlan {
    const amount = Math.round(d.price ?? 0).toString();
    return {
      ...this.renewalPlan(),
      amount,
      priceLabel: `ج${amount}`,
      periodLabel: d.validityDays ? `/ ${d.validityDays} يوم` : '/ ٣٠ يوم',
    };
  }

  handleRenew(price: string) {
    console.log('Renewing for', price);
  }

  private calcExpiredDays(endDate: string | null): number {
    if (!endDate) return 0;
    const diff = Date.now() - new Date(endDate).getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }
}
