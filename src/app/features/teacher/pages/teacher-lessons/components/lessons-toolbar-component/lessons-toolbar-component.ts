import { CdkMenu, CdkMenuItemRadio, CdkMenuTrigger } from '@angular/cdk/menu';
import { Component, computed, input, model, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import {
  bootstrapCheck2,
  bootstrapChevronDown,
  bootstrapPlusLg,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { SearchInputComponent } from '../../../../../../shared/components/search-input/search-input.component';
import {
  StatusCounts,
  StatusFilter,
  TeacherLessonSort,
} from '../../../../models/Teacherlesson.model';

@Component({
  selector: 'app-lessons-toolbar',
  imports: [
    RouterModule,
    TranslatePipe,
    NgIcon,
    NgmMotionDirective,
    SearchInputComponent,
    CdkMenu,
    CdkMenuItemRadio,
    CdkMenuTrigger,
  ],
  templateUrl: './lessons-toolbar-component.html',
  providers: [provideIcons({ bootstrapCheck2, bootstrapChevronDown, bootstrapPlusLg })],
})
export class LessonsToolbarComponent {
  public readonly searchQuery = model('');
  public readonly statusFilter = model<StatusFilter>('all');
  public readonly sort = model<TeacherLessonSort>('newest');
  public readonly counts = input.required<StatusCounts>();

  protected readonly filterOptions: { value: StatusFilter; labelKey: string }[] = [
    { value: 'all', labelKey: 'TEACHER_LESSONS_PAGE.LESSONS_TOOLBAR.FILTER.ALL' },
    { value: 'active', labelKey: 'TEACHER_LESSONS_PAGE.LESSONS_TOOLBAR.FILTER.ACTIVE' },
    { value: 'hidden', labelKey: 'TEACHER_LESSONS_PAGE.LESSONS_TOOLBAR.FILTER.HIDDEN' },
    { value: 'drafted', labelKey: 'TEACHER_LESSONS_PAGE.LESSONS_TOOLBAR.FILTER.DRAFTED' },
  ];

  protected readonly sortOptions: { value: TeacherLessonSort; labelKey: string }[] = [
    { value: 'newest', labelKey: 'TEACHER_LESSONS_PAGE.LESSONS_TOOLBAR.SORT.NEWEST' },
    { value: 'mostStudents', labelKey: 'TEACHER_LESSONS_PAGE.LESSONS_TOOLBAR.SORT.MOST_STUDENTS' },
    { value: 'highestRevenue', labelKey: 'TEACHER_LESSONS_PAGE.LESSONS_TOOLBAR.SORT.HIGHEST_REVENUE' },
    { value: 'priceHigh', labelKey: 'TEACHER_LESSONS_PAGE.LESSONS_TOOLBAR.SORT.PRICE_HIGH' },
    { value: 'priceLow', labelKey: 'TEACHER_LESSONS_PAGE.LESSONS_TOOLBAR.SORT.PRICE_LOW' },
  ];

  protected readonly sortOpen = signal(false);
  protected readonly filterOpen = signal(false);

  protected readonly currentSortLabelKey = computed(
    () => this.sortOptions.find((option) => option.value === this.sort())?.labelKey ?? '',
  );

  protected readonly currentFilterLabelKey = computed(
    () => this.filterOptions.find((option) => option.value === this.statusFilter())?.labelKey ?? '',
  );
}
