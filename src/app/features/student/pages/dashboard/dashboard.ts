import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { bootstrapWifiOff } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { DashboardResponse } from '../../../../core/Models/Student/Dashboard.Models';
import { DashboardService } from '../../../../core/Services/dashboard.service';
import { DiscoverBanner } from './components/discover-banner/discover-banner';
import { HeroGreet } from './components/hero-greet/hero-greet';
import { LessonsGridComponent } from './components/lessons-grid/lessons-grid';
import { NextLessonCardComponent } from './components/next-lesson-card/next-lesson-card';
import { StatsStripComponent } from './components/stats-strip/stats-strip';

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

  public ngOnInit(): void {
    this.loadDashboard();
  }

  protected loadDashboard(): void {
    this.loading.set(true);
    this.error.set(false);

    this.dashboardService.getDashboard().subscribe({
      next: (res) => {
        if (res != null) {
          this.data.set(res);
          console.log(this.data());
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  /**
   * Called when a lesson card CTA is clicked.
   * Route logic lives here so cards stay dumb.
   */
  protected onLessonCta(lessonId: string): void {
    const lesson = this.data()?.lessons.find((l) => l.id === lessonId);
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
