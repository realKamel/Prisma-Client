import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule }              from '@angular/common';
import { ActivatedRoute }            from '@angular/router';
import { forkJoin }                  from 'rxjs';

import { LessonService }              from '../../../../core/Services/lesson.service';
import { BreadcrumbComponent }        from './components/breadcrumb-component/breadcrumb-component';
import { ExpiredLessonCardComponent } from './components/expired-lesson-card-component/expired-lesson-card-component';
import { RenewalCardComponent }       from './components/renewal-card-component/renewal-card-component';
import { AltOptionsCardComponent }    from './components/alt-options-card-component/alt-options-card-component';

import {
  AltOption,
  BreadcrumbItem,
  LessonCardData,
  LessonApiResponse,
  LessonStatusApi,
  RenewalPlan,
} from '../../../../core/Models/lesson-expired';


@Component({
  selector: 'app-lesson-expired',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbComponent,
    ExpiredLessonCardComponent,
    RenewalCardComponent,
    AltOptionsCardComponent,
  ],
  templateUrl: './lesson-expired.html',
})
export class LessonExpiredComponent implements OnInit {
  private route         = inject(ActivatedRoute);
  private lessonService = inject(LessonService);

  loading = true;
  error   = '';

  // ── Breadcrumb ───────────────────────────────────────────────────────
  breadcrumbs: BreadcrumbItem[] = [
    { label: 'الرئيسية',       link: '/dashboard' },
    { label: 'دروسي',          link: '/history'   },
    { label: 'انتهت الصلاحية', colorClass: 'text-[var(--coral)]' },
  ];

  // ── Lesson card (filled after API) ──────────────────────────────────
  lessonData: LessonCardData = {
    subjectTag:      '',
    title:           '',
    description:     '',
    thumbnailUrl:    null,
    stats:           [],
    progressPercent: 0,
    expiredDaysAgo:  0,
  };

  // ── Renewal plan (price updated from API) ────────────────────────────
  renewalPlan: RenewalPlan = {
    priceLabel:     '',
    currency:       'ج',
    amount:         '',
    periodLabel:    '/ ٣٠ يوم',
    features: [
      'وصول كامل لجميع الفيديوهات',
      'ملفات PDF وملخصات المراجعة',
      'كويز تفاعلي مع نتيجة فورية',
      'تقدمك السابق محفوظ بالكامل',
    ]  };

  // ── Alternative options ──────────────────────────────────────────────
  altOptions: AltOption[] = [
    { icon: 'bi-mortarboard',     iconVariant: 'purple', name: 'تصفح دروس أخرى', subtitle: 'اكتشف دروسًا جديدة في مكتبتنا', link: '/lessons' },
    { icon: 'bi-currency-dollar', iconVariant: 'coral',  name: 'طلب استرداد',     subtitle: 'واجهت مشكلة؟ نستردّ لك المبلغ',  link: '/refund'  },
    { icon: 'bi-chat-dots',       iconVariant: 'mint',   name: 'تواصل مع الدعم', subtitle: 'فريقنا جاهز للمساعدة',            link: '/support' },
  ];

  // ────────────────────────────────────────────────────────────────────

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.loadLesson(id);
  }

  private loadLesson(id: string) {
    this.loading = true;
    this.error   = '';

    forkJoin({
      details: this.lessonService.getLessonDetails(id),
      status:  this.lessonService.getLessonStatus(id) as any,
    }).subscribe({
      next: ({ details, status }: { details: any; status: any }) => {
        const lesson = details.data  as LessonApiResponse;
        const stat   = (status?.data ?? null) as LessonStatusApi | null;

        this.lessonData  = this.mapApiToCard(lesson, stat);
        this.renewalPlan = this.buildRenewalPlan(lesson);
        this.loading     = false; 
        this.cdr.detectChanges(); // Ensure view updates after async data     
      },
      error: () => {
        this.error   = 'تعذّر تحميل بيانات الدرس. حاول مجددًا.';
        this.loading = false;
      },
    });
  }
  private cdr = inject(ChangeDetectorRef);

  // ── Mapping ──────────────────────────────────────────────────────────

  private mapApiToCard(d: LessonApiResponse, s: LessonStatusApi | null): LessonCardData {
    return {
      subjectTag:      d.academicYears?.[0]?.name ?? '',
      title:           d.title                    ?? '',
      description:     d.description              ?? '',
      thumbnailUrl:    d.imageThumbnailUrl,
      expiredDaysAgo:  this.calcExpiredDays(d.endDate),
      progressPercent: s?.progressPercent ?? 0,
      stats:           this.buildStats(d),
    };
  }

  private buildStats(d: LessonApiResponse) {
    const videoCount = d.sections
      ?.reduce((sum, sec) => sum + (sec.videos?.length ?? 0), 0) ?? 0;

    const pdfCount = d.lessonMaterials
      ?.filter(m => m.type === 'PDF' || m.fileUrl?.toLowerCase().endsWith('.pdf'))
      .length ?? 0;

    const duration  = this.formatDuration(d.duration);
    const quizScore = d.quizAttempt?.degree ?? null;

    return [
      { icon: 'bi-camera-video',     value: videoCount.toString(), label: 'فيديوهات' },
      { icon: 'bi-clock',            value: duration,              label: 'ساعة'      },
      { icon: 'bi-file-earmark-pdf', value: pdfCount.toString(),   label: 'ملفات PDF' },
      ...(quizScore !== null ? [{
        icon:       'bi-star-fill',
        value:      `${Math.round(quizScore)}٪`,
        label:      'نتيجتك:',
        valueColor: 'var(--star)',
      }] : []),
    ];
  }

  private buildRenewalPlan(d: LessonApiResponse): RenewalPlan {
    const amount = Math.round(d.price).toString();
    return {
      ...this.renewalPlan,
      amount,
      priceLabel: `ج${amount}`,
    };
  }

  // ── Helpers ──────────────────────────────────────────────────────────

  private calcExpiredDays(endDate: string | null): number {
    if (!endDate) return 0;
    const diff = Date.now() - new Date(endDate).getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }

  private formatDuration(ts: string | null): string {
    if (!ts) return '—';
    const [h, m] = ts.split(':');
    return `${parseInt(h, 10)}:${m}`;
  }

  // ────────────────────────────────────────────────────────────────────

  handleRenew(price: string) {
    // this.router.navigate(['/checkout'], { queryParams: { lessonId: ..., price } });
    console.log('Renewing for', price);
  }
}