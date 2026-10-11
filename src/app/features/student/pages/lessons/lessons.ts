import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import {
  cardEntranceTransition,
  pageEntranceAnimate,
  pageEntranceInitial,
  pageEntranceTransition,
  stateSwapTransition,
} from '../../../../core/animations/motion.animations';
import { Lesson, StudentEnrollmentStatus } from '../../../../core/Models/lesson-model';
import { LessonService } from '../../../../core/Services/lesson-service';
import { LessonCardComponent } from './lesson-card/lesson-card';

type FilterKey = 'all' | StudentEnrollmentStatus;

@Component({
  selector: 'app-lessons',
  imports: [RouterModule, LessonCardComponent, NgmMotionDirective],
  templateUrl: './lessons.html',
  styleUrls: ['./lessons.css'],
})
export class LessonsComponent implements OnInit {
  private lessonService = inject(LessonService);

  protected readonly pageInitial = pageEntranceInitial;
  protected readonly pageAnimate = pageEntranceAnimate;
  protected readonly pageTransition = pageEntranceTransition;
  protected readonly cardTransition = cardEntranceTransition;
  protected readonly stateTransition = stateSwapTransition;

  // Core State Signals
  protected readonly lessons = signal<Lesson[]>([]);
  protected readonly isLoading = signal<boolean>(true);
  protected readonly activeFilter = signal<FilterKey>('all');

  // Immutable Configuration Data
  protected readonly filters: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'الكل' },
    { key: 'active', label: 'متاح' },
    // { key: 'purchased', label: 'مشتري' },
    { key: 'locked', label: 'مقفول' },
    { key: 'expired', label: 'منتهي الصلاحية' },
    { key: 'done', label: 'مكتمل' },
    {
      key: 'suspended',
      label: 'معلق',
    },
  ];

  protected readonly counts = computed<Record<FilterKey, number>>(() => {
    const list = this.lessons();
    return {
      all: list.length,
      active: list.filter((l) => l.status === 'active').length,
      // purchased: list.filter((l) => l.status === 'purchased').length,
      locked: list.filter((l) => l.status === 'locked').length,
      expired: list.filter((l) => l.status === 'expired').length,
      done: list.filter((l) => l.status === 'done').length,
      suspended: list.filter((l) => l.status === 'suspended').length,
      available: list.filter((l) => l.status === 'available').length,
    };
  });

  protected readonly filteredLessons = computed<Lesson[]>(() => {
    const list = this.lessons();
    const filter = this.activeFilter();
    return filter === 'all' ? list : list.filter((l) => l.status === filter);
  });

  public ngOnInit(): void {
    this.isLoading.set(true);
    this.lessonService.getLessonsCatalog().subscribe({
      next: (data) => {
        this.lessons.set(data.items ?? []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  protected setFilter(filter: FilterKey): void {
    this.activeFilter.set(filter);
  }
}
