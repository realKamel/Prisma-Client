import { Component, inject, input, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { bootstrapExclamationTriangle } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { LessonResponse } from '../../../../../core/Models/lesson.model';
import { LessonService } from '../../../../../core/Services/lesson.service';
import { LessonAboutComponent } from './components/lesson-about-component/lesson-about-component';
import { LessonChaptersComponent } from './components/lesson-chapters-component/lesson-chapters-component';
import { LessonHeroComponent } from './components/lesson-hero/lesson-hero';
import { LessonOutcomesComponent } from './components/lesson-outcomes-component/lesson-outcomes-component';
import { LessonPrerequisitesComponent } from './components/lesson-prerequisites-component/lesson-prerequisites-component';
import { LessonPriceCardComponent } from './components/lesson-price-card-component/lesson-price-card-component';

@Component({
  selector: 'app-lesson-detail',
  imports: [
    LessonHeroComponent,
    LessonAboutComponent,
    LessonOutcomesComponent,
    LessonPrerequisitesComponent,
    LessonChaptersComponent,
    LessonPriceCardComponent,
    RouterLink,
    NgIcon,
  ],
  templateUrl: './lesson-detail.html',
  viewProviders: [
    provideIcons({
      bootstrapExclamationTriangle,
    }),
  ],
})
export class LessonDetailComponent implements OnInit {
  private lessonService = inject(LessonService);
  private router = inject(Router);
  public readonly lessonData = signal<LessonResponse | null>(null);
  public readonly isLoading = signal<boolean>(true);
  public readonly hasError = signal<boolean>(false);
  public readonly id = input.required<string>();

  public ngOnInit(): void {
    this.fetchLessonDetails();
  }

  private fetchLessonDetails(): void {
    this.lessonService.getLessonDetails(this.id()).subscribe({
      next: (res) => {
        this.lessonData.set(res);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error:', err);
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  public buyNow(): void {
    const data = this.lessonData();
    this.lessonService.setCurrentLesson(data);
    void this.router.navigate([`/lessons/${data?.id}/checkout`]);
  }

  public RedeemWithCode(): void {
    const data = this.lessonData();
    this.lessonService.setCurrentLesson(data);
    void this.router.navigate([`/lessons/${data?.id}/redeem`]);
  }
}
