// dashboard/dashboard.component.ts
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { DashboardResponse } from '../../../core/Models/Student/Dashboard.Models';
import { DashboardService } from '../../../core/Services/dashboard.service';

import { HeroGreet }     from './components/hero-greet/hero-greet';
import { NextLessonCard } from './components/next-lesson-card/next-lesson-card';
import { LessonsGrid }    from './components/lessons-grid/lessons-grid';
import { StatsStrip }     from './components/stats-strip/stats-strip';
import { DiscoverBanner } from './components/discover-banner/discover-banner';
import { AuthService } from '../../../core/Services/auth';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    HeroGreet,
    NextLessonCard,
    LessonsGrid,
    StatsStrip,
    DiscoverBanner,
  ],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  data: DashboardResponse | null = null;
  loading = true;
  error = false;

  constructor(
    private dashboardService: DashboardService,
    private http: HttpClient,
    private router: Router,
    private cdr : ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = false;

    // this.dashboardService.getDashboard().subscribe({
    this.http.get<DashboardResponse>('assets/data/mock-dashboard.json').subscribe({
      next: (res) => {
        // this.data = res.data;
        this.data = res;
        this.loading = false;
        this.cdr.detectChanges();
        console.log('success')
      },
      error: () => {
        this.error = true; 
        this.loading = false;
        this.cdr.detectChanges();
        console.log('error')
      },
    });
  }

  /**
   * Called when a lesson card CTA is clicked.
   * Route logic lives here so cards stay dumb.
   */
  onLessonCta(lessonId: string): void {
    const lesson = this.data?.lessons.find(l => l.id === lessonId);
    if (!lesson) return;

    switch (lesson.status) {
      case 'done':
      case 'progress':
      case 'warn':
        this.router.navigate(['/lessons', lessonId, 'watch']);
        break;
      case 'new':
        this.router.navigate(['/lessons', lessonId]);
        break;
      case 'expired':
        this.router.navigate(['/lessons', lessonId, 'expired']);
        break;
    }
  }
}