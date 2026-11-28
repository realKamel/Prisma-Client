import { Component, inject, input, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { LessonResponse } from '../../../../../domain/lessons/models/lesson.model';
import { LessonService } from '../../../../../domain/lessons/services/lesson.service';
import {
  contentEntranceAnimate,
  contentEntranceInitial,
  contentEntranceTransition,
  pageEntranceAnimate,
  pageEntranceInitial,
  pageEntranceTransition,
} from '../../../../../shared/animations/motion.animations';
import { LessonAboutComponent } from './components/lesson-about-component/lesson-about-component';
import { LessonChaptersComponent } from './components/lesson-chapters-component/lesson-chapters-component';
import { LessonHeroComponent } from './components/lesson-hero/lesson-hero';
import { LessonOutcomesComponent } from './components/lesson-outcomes-component/lesson-outcomes-component';
import { LessonPrerequisitesComponent } from './components/lesson-prerequisites-component/lesson-prerequisites-component';
import { LessonPriceCardComponent } from './components/lesson-price-card-component/lesson-price-card-component';
import { bootstrapCollectionPlay, bootstrapExclamationTriangle, bootstrapWallet2 } from '@ng-icons/bootstrap-icons';
import { autoStartTour } from '../../../../../core/services/tours/auto-start-tour';
import { TourStep, TOUR_KEYS } from '../../../../../core/models/tour.model';
import { TourStepDirective } from '../../../../../shared/directives/tour-step/tour-step.directive';

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
    NgmMotionDirective,
    TourStepDirective
  ],
  templateUrl: './lesson-detail.html',
  viewProviders: [
    provideIcons({
      bootstrapCollectionPlay, bootstrapExclamationTriangle, bootstrapWallet2,
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

  protected readonly pageInitial = pageEntranceInitial;
  protected readonly pageAnimate = pageEntranceAnimate;
  protected readonly pageTransition = pageEntranceTransition;

  protected readonly sectionInitial = contentEntranceInitial;
  protected readonly sectionAnimate = contentEntranceAnimate;
  protected readonly sectionTransition = contentEntranceTransition;

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
  private readonly tourSteps: TourStep[] = [
    {
      element: '[data-tour-step="student-purchase-chapters"]',
      titleKey: 'TOUR.STUDENT.PURCHASE.CHAPTERS.TITLE',
      descriptionKey: 'TOUR.STUDENT.PURCHASE.CHAPTERS.DESCRIPTION',
      icon: bootstrapCollectionPlay,
    },
    {
      element: '[data-tour-step="student-purchase-price"]',
      titleKey: 'TOUR.STUDENT.PURCHASE.PRICE.TITLE',
      descriptionKey: 'TOUR.STUDENT.PURCHASE.PRICE.DESCRIPTION',
      icon: bootstrapWallet2,
    },
  ];

  constructor() {
    autoStartTour({
      key: TOUR_KEYS.student.purchase,
      steps: () => this.tourSteps,
      ready: () => !this.isLoading() && !this.hasError() && !!this.lessonData(),
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
