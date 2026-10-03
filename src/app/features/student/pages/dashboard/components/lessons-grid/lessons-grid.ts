// dashboard/components/lessons-grid/lessons-grid.component.ts
import { Component, computed, input, OnChanges, output, signal } from '@angular/core';

import { RouterModule } from '@angular/router';
import { bootstrapArrowLeft, bootstrapInbox } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import {
  LessonCardDto,
  LessonStatus,
} from '../../../../../../core/Models/Student/Dashboard.Models';
import { LessonCardComponent } from '../lesson-card/lesson-card';

import { Filter } from '../../../../../../core/Models/Student/student-ui.model';

type FilterKey = 'all' | LessonStatus;

@Component({
  selector: 'app-lessons-grid',
  imports: [RouterModule, LessonCardComponent, NgIcon, NgmMotionDirective],
  templateUrl: './lessons-grid.html',
  viewProviders: [
    provideIcons({
      bootstrapInbox,
      bootstrapArrowLeft,
    }),
  ],
})
export class LessonsGridComponent implements OnChanges {
  public readonly lessons = input.required<LessonCardDto[]>();
  public readonly lessonCta = output<string>();

  protected readonly activeFilter = signal<FilterKey>('all');

  protected readonly filters: Filter<FilterKey>[] = [
    { key: 'all', label: 'الكل' },
    { key: 'progress', label: 'في التقدم' },
    { key: 'new', label: 'ما اتفتحش' },
    { key: 'done', label: 'مكتمل' },
    { key: 'expired', label: 'منتهي' },
  ];

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
