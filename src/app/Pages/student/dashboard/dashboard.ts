import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardResponse } from '../../../core/Models/Student/Dashboard.Models';
import { DashboardService } from '../../../core/Services/dashboard.service';
import { HeroGreet } from './components/hero-greet/hero-greet';
import { NextLessonCard } from './components/next-lesson-card/next-lesson-card';
import { LessonsGrid } from './components/lessons-grid/lessons-grid';
import { StatsStrip } from './components/stats-strip/stats-strip';
import { DiscoverBanner } from './components/discover-banner/discover-banner';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapWifiOff } from '@ng-icons/bootstrap-icons';

@Component({
  selector: 'app-dashboard',
  imports: [HeroGreet, NextLessonCard, LessonsGrid, StatsStrip, DiscoverBanner, NgIcon],
  templateUrl: './dashboard.html',
  viewProviders: [
    provideIcons({
      bootstrapWifiOff,
    }),
  ],
})
export class Dashboard implements OnInit {
  private dashboardService = inject(DashboardService);
  private router = inject(Router);

  protected readonly data = signal<DashboardResponse>({} as DashboardResponse);

  loading = signal(true);
  error = signal(false);

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.error.set(false);

    this.dashboardService.getDashboard().subscribe({
      next: (res) => {
        if (res.data != null) {
          this.data.set(res.data);
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
  onLessonCta(lessonId: string): void {
    const lesson = this.data()?.lessons.find((l) => l.id === lessonId);
    if (!lesson) return;

    switch (lesson.status) {
      case 'done':
      case 'progress':
      case 'warn':
      case 'new':
        this.router.navigate(['/lessons', lessonId, 'watch']);
        break;

      case 'expired':
        this.router.navigate(['/lessons', lessonId, 'expired']);
        break;
    }
  }
}
