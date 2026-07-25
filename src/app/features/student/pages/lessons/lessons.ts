import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LessonService } from '../../../../core/Services/lesson-service';
import { Lesson } from '../../../../core/Models/lesson-model';
import { LessonCardComponent } from './lesson-card/lesson-card';

type FilterKey = 'all' | 'avail' | 'purchased' | 'locked' | 'expired';

@Component({
  selector: 'app-lessons',
  imports: [RouterModule, LessonCardComponent],
  templateUrl: './lessons.html',
  styleUrls: ['./lessons.css'],
})
export class LessonsComponent implements OnInit {
  private lessonService = inject(LessonService);

  // Core State Signals
  readonly lessons = signal<Lesson[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly activeFilter = signal<FilterKey>('all');

  // Immutable Configuration Data
  readonly filters: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'الكل' },
    { key: 'avail', label: 'متاح' },
    { key: 'purchased', label: 'مشتري' },
    { key: 'locked', label: 'مقفول' },
    { key: 'expired', label: 'منتهي الصلاحية' },
  ];

  // Derived State Computeds (No more manual sync logic required)
  readonly counts = computed<Record<FilterKey, number>>(() => {
    const list = this.lessons();
    return {
      all: list.length,
      avail: list.filter((l) => l.status === 'avail').length,
      purchased: list.filter((l) => l.status === 'purchased').length,
      locked: list.filter((l) => l.status === 'locked').length,
      expired: list.filter((l) => l.status === 'expired').length,
    };
  });

  readonly filteredLessons = computed<Lesson[]>(() => {
    const list = this.lessons();
    const filter = this.activeFilter();
    return filter === 'all' ? list : list.filter((l) => l.status === filter);
  });

  ngOnInit(): void {
    this.isLoading.set(true);
    this.lessonService.getLessons().subscribe({
      next: (data) => {
        this.lessons.set(data ?? []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  setFilter(filter: FilterKey): void {
    this.activeFilter.set(filter);
  }
}
