// dashboard/components/lessons-grid/lessons-grid.component.ts
import { Component, computed, input, OnChanges, output, signal } from '@angular/core';

import { RouterModule } from '@angular/router';
import { bootstrapArrowLeft, bootstrapBook, bootstrapInbox } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { TranslatePipe } from '@ngx-translate/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { LessonCardDto, LessonStatus } from '../../../../models/dashboard.models';
import { LessonCardComponent } from '../lesson-card/lesson-card';

import { Filter } from '../../../../models/student-ui.model';

type FilterKey = 'all' | LessonStatus;

@Component({
  selector: 'app-lessons-grid',
  imports: [RouterModule, LessonCardComponent, NgIcon, NgmMotionDirective, TranslatePipe],
  templateUrl: './lessons-grid.html',
  viewProviders: [
    provideIcons({
      bootstrapInbox,
      bootstrapBook,
      bootstrapArrowLeft,
    }),
  ],
})
export class LessonsGridComponent implements OnChanges {
  public readonly lessons = input.required<LessonCardDto[]>();
  public readonly lessonCta = output<string>();

  protected readonly activeFilter = signal<FilterKey>('all');

  // `label` holds a translation key; the template runs it through the translate pipe
  protected readonly filters: Filter<FilterKey>[] = [
    { key: 'all', label: 'DASHBOARD.LESSONS_GRID.FILTERS.ALL' },
    { key: 'progress', label: 'DASHBOARD.LESSONS_GRID.FILTERS.PROGRESS' },
    { key: 'new', label: 'DASHBOARD.LESSONS_GRID.FILTERS.NEW' },
    { key: 'done', label: 'DASHBOARD.LESSONS_GRID.FILTERS.DONE' },
    { key: 'expired', label: 'DASHBOARD.LESSONS_GRID.FILTERS.EXPIRED' },
  ];

  /** false = the student has no lessons at all (true empty state, no filters shown) */
  protected readonly hasLessons = computed(() => this.lessons().length > 0);

  protected readonly filteredLessons = computed(() => {
    const filter = this.activeFilter();
    const list = this.lessons();
    if (filter === 'all') return list;
    return list.filter((l) => l.status === filter);
  });

  protected getCount(key: FilterKey): number {
    if (key === 'all') return this.lessons().length;
    return this.lessons().filter((l) => l.status === key).length;
  }

  public ngOnChanges(): void {
    // reset filter if active filter has no items
    if (this.getCount(this.activeFilter()) === 0) {
      this.activeFilter.set('all');
    }
  }
}