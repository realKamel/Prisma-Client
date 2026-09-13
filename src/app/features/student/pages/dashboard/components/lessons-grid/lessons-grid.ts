// dashboard/components/lessons-grid/lessons-grid.component.ts
import { Component, OnChanges, output, input, signal, computed } from '@angular/core';

import { RouterModule } from '@angular/router';
import {
  LessonCardDto,
  LessonStatus,
} from '../../../../../../core/Models/Student/Dashboard.Models';
import { LessonCardComponent } from '../lesson-card/lesson-card';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapArrowLeft, bootstrapInbox } from '@ng-icons/bootstrap-icons';
import { NgmMotionDirective } from '@scripttype/ng-motion';

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
  readonly lessons = input.required<LessonCardDto[]>();
  readonly lessonCta = output<string>();

  readonly activeFilter = signal<FilterKey>('all');

  readonly filters: Filter<FilterKey>[] = [
    { key: 'all', label: 'الكل' },
    { key: 'progress', label: 'في التقدم' },
    { key: 'new', label: 'ما اتفتحش' },
    { key: 'done', label: 'مكتمل' },
    { key: 'expired', label: 'منتهي' },
  ];

  readonly filteredLessons = computed(() => {
    const filter = this.activeFilter();
    const list = this.lessons();
    if (filter === 'all') return list;
    return list.filter((l) => l.status === filter);
  });

  getCount(key: FilterKey): number {
    if (key === 'all') return this.lessons().length;
    return this.lessons().filter((l) => l.status === key).length;
  }

  ngOnChanges(): void {
    // reset filter if active filter has no items
    if (this.getCount(this.activeFilter()) === 0) {
      this.activeFilter.set('all');
    }
  }
}
