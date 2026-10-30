import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  bootstrapCameraVideo,
  bootstrapChatDots,
  bootstrapClock,
  bootstrapCurrencyDollar,
  bootstrapExclamationCircle,
  bootstrapFileEarmarkPdf,
  bootstrapMortarboard,
  bootstrapStarFill,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';

import { CurrencyPipe } from '@angular/common';
import {
  AltOption,
  BreadcrumbItem,
  LessonApiResponse,
  LessonCardData,
  RenewalPlan,
} from '../../../../../domain/lessons/models/lesson-expired';

import { LessonService } from '../../../../../domain/lessons/services/lesson.service';
import { DurationPipe } from '../../../../../shared/pipes/duration/duration-pipe';
import { AltOptionsCardComponent } from './components/alt-options-card-component/alt-options-card-component';
import { BreadcrumbComponent } from './components/breadcrumb-component/breadcrumb-component';
import { ExpiredLessonCardComponent } from './components/expired-lesson-card-component/expired-lesson-card-component';
import { RenewalCardComponent } from './components/renewal-card-component/renewal-card-component';

@Component({
  selector: 'app-lesson-expired',
  imports: [
    NgIcon,
    ExpiredLessonCardComponent,
    RenewalCardComponent,
    AltOptionsCardComponent,
    BreadcrumbComponent,
  ],
  templateUrl: './lesson-expired.html',
  viewProviders: [
    provideIcons({
      bootstrapExclamationCircle,
      bootstrapMortarboard,
      bootstrapCurrencyDollar,
      bootstrapChatDots,
      bootstrapCameraVideo,
      bootstrapClock,
      bootstrapFileEarmarkPdf,
      bootstrapStarFill,
    }),
  ],
  providers: [DurationPipe, CurrencyPipe],
})
export class LessonExpiredComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private lessonService = inject(LessonService);
  private readonly durationPipe = inject(DurationPipe);
  private readonly currencyPipe = inject(CurrencyPipe);
  // Core State Signals
  readonly loading = signal<boolean>(true);
  readonly error = signal<string>('');

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'الرئيسية', link: '/dashboard' },
    { label: 'دروسي', link: '/history' },
    { label: 'انتهت الصلاحية', colorClass: 'text-coral' },
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
    currency: 'EGP',
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
      icon: 'bootstrapMortarboard',
      iconVariant: 'purple',
      name: 'تصفح دروس أخرى',
      subtitle: 'اكتشف دروسًا جديدة في مكتبتنا',
      link: '/lessons',
    },
    {
      icon: 'bootstrapCurrencyDollar',
      iconVariant: 'coral',
      name: 'طلب استرداد',
      subtitle: 'واجهت مشكلة؟ نستردّ لك المبلغ',
      link: '/refund',
    },
    {
      icon: 'bootstrapChatDots',
      iconVariant: 'mint',
      name: 'تواصل مع الدعم',
      subtitle: 'فريقنا جاهز للمساعدة',
      link: '/support',
    },
  ];

  public ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.loadLesson(id);
  }

  private loadLesson(id: string) {
    this.loading.set(true);
    this.error.set('');

    this.lessonService.getExpiredLessonDetails(id).subscribe({
      next: (res) => {
        this.lessonData.set(this.mapApiToCard(res));
        this.renewalPlan.set(this.buildRenewalPlan(res));
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

  private buildStats(d: LessonApiResponse) {
    const videoCount = d.chaptersCount ?? d.chapters?.length ?? 0;
    const materials = d.materialsCount ?? 0;
    const durationInSeconds = d.chapters.reduce((accumulator, current) => {
      return accumulator + current.duration.seconds;
    }, 1000);
    const duration = this.durationPipe.transform(durationInSeconds, 'human');
    const quizScore = d.degree;

    const iconMap: Record<string, string> = {
      'bi-camera-video': 'bootstrapCameraVideo',
      'bi-clock': 'bootstrapClock',
      'bi-file-earmark-pdf': 'bootstrapFileEarmarkPdf',
      'bi-star-fill': 'bootstrapStarFill',
    };

    return [
      { icon: iconMap['bi-camera-video'], value: videoCount.toString(), label: 'فيديوهات' },
      { icon: iconMap['bi-clock'], value: duration, label: '' },
      { icon: iconMap['bi-file-earmark-pdf'], value: materials.toString(), label: 'ملفات PDF' },
      ...(quizScore !== null
        ? [
            {
              icon: iconMap['bi-star-fill'],
              value: `${Math.round(quizScore)}`,
              label: '%',
              valueColor: 'var(--color-star)',
            },
          ]
        : []),
    ];
  }

  private buildRenewalPlan(d: LessonApiResponse): RenewalPlan {
    const amount = Math.round(d.price ?? 0).toString();
    return {
      ...this.renewalPlan(),
      amount,
      priceLabel: this.currencyPipe.transform(amount, d.money?.currency ?? 'EGP') ?? '',
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
