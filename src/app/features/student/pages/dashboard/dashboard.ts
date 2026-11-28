import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  bootstrapBarChartLine,
  bootstrapCollectionPlay,
  bootstrapCompass,
  bootstrapFire,
  bootstrapPlayCircle,
  bootstrapWifiOff,
} from '@ng-icons/bootstrap-icons'; 
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { DashboardResponse, StatsHistoryDto } from '../../models/dashboard.models';
import { DiscoverBanner } from './components/discover-banner/discover-banner';
import { HeroGreet } from './components/hero-greet/hero-greet';
import { LessonsGridComponent } from './components/lessons-grid/lessons-grid';
import { NextLessonCardComponent } from './components/next-lesson-card/next-lesson-card';
import { StatsStripComponent } from './components/stats-strip/stats-strip';
import { DashboardService } from './services/dashboard.service';
import { TourStep } from '../../../../core/models/tour.model';
import { TOUR_KEYS } from '../../../../core/models/tour.model';
import { TourStepDirective } from '../../../../shared/directives/tour-step/tour-step.directive';
import { autoStartTour } from '../../../../core/services/tours/auto-start-tour';

@Component({
  selector: 'app-dashboard',
  imports: [
    HeroGreet,
    NextLessonCardComponent,
    LessonsGridComponent,
    StatsStripComponent,
    DiscoverBanner,
    NgIcon,
    NgmMotionDirective,
    TourStepDirective,
  ],
  templateUrl: './dashboard.html',
  viewProviders: [
    provideIcons({
      bootstrapWifiOff,
    }),
  ],
})
export class DashboardPageComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly router = inject(Router);
  protected readonly data = signal<DashboardResponse>({} as DashboardResponse);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);

  protected readonly history = signal<StatsHistoryDto | null>(null);
  protected readonly historyLoading = signal(false);

  private readonly welcomeSteps: TourStep[] = [
    {
      element: '[data-tour-step="student-welcome-hero"]',
      titleKey: 'TOUR.STUDENT.WELCOME.HERO.TITLE',
      descriptionKey: 'TOUR.STUDENT.WELCOME.HERO.DESCRIPTION',
      side: 'bottom',
      icon: bootstrapFire,
      motion: 'flicker',
    },
    {
      element: '[data-tour-step="student-welcome-next-lesson"]',
      titleKey: 'TOUR.STUDENT.WELCOME.NEXT_LESSON.TITLE',
      descriptionKey: 'TOUR.STUDENT.WELCOME.NEXT_LESSON.DESCRIPTION',
      side: 'bottom',
      icon: bootstrapPlayCircle,
    },
    {
      element: '[data-tour-step="student-welcome-stats"]',
      titleKey: 'TOUR.STUDENT.WELCOME.STATS.TITLE',
      descriptionKey: 'TOUR.STUDENT.WELCOME.STATS.DESCRIPTION',
      side: 'bottom',
      icon: bootstrapBarChartLine,
    },
    {
      element: '[data-tour-step="student-welcome-lessons"]',
      titleKey: 'TOUR.STUDENT.WELCOME.LESSONS.TITLE',
      descriptionKey: 'TOUR.STUDENT.WELCOME.LESSONS.DESCRIPTION',
      side: 'top',
      icon: bootstrapCollectionPlay,
    },
    {
      element: '[data-tour-step="student-welcome-discover"]',
      titleKey: 'TOUR.STUDENT.WELCOME.DISCOVER.TITLE',
      descriptionKey: 'TOUR.STUDENT.WELCOME.DISCOVER.DESCRIPTION',
      side: 'top',
      icon: bootstrapCompass,
    },
  ];
  public ngOnInit(): void {
    this.loadDashboard();
  }
  constructor() {
    autoStartTour({
      key: TOUR_KEYS.student.welcome,
      steps: () => this.welcomeSteps,
      ready: () => !this.loading() && !this.error() && !!this.data()?.student,
    });
  }
  protected loadDashboard(): void {
    this.loading.set(true);
    this.error.set(false);

    this.dashboardService.getDashboard().subscribe({
      next: (res) => {
        if (res != null) {
          this.data.set(res);
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  /** Loaded lazily the first time a stats tile is opened, then cached in the signal. */
  protected loadHistory(): void {
    if (this.historyLoading()) return;
    this.historyLoading.set(true);

    this.dashboardService.getStatsHistory().subscribe({
      next: (res) => {
        this.history.set(res);
        this.historyLoading.set(false);
      },
      error: () => this.historyLoading.set(false),
    });
  }

  /**
   * Called when a lesson card CTA is clicked.
   * Route logic lives here so cards stay dumb.
   */
  protected onLessonCta(lessonId: string): void {
    const lesson = this.data()?.lessons.find((l) => l.lessonPublicId === lessonId);
    if (!lesson) return;

    switch (lesson.status) {
      case 'done':
      case 'progress':
      case 'warn':
      case 'new':
        void this.router.navigate(['/lessons', lessonId, 'watch']);
        break;

      case 'expired':
        void this.router.navigate(['/lessons', lessonId, 'expired']);
        break;
    }
  }
}