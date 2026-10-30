import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { catchError, debounceTime, distinctUntilChanged, EMPTY, map, switchMap } from 'rxjs';
import { DeleteModalService } from '../../../../shared/components/delete-modal/delete-modal.service';
import { PaginatorComponent } from '../../../../shared/components/paginator/paginator';
import {
  StatusFilter,
  TeacherLesson,
  TeacherLessonSort,
} from '../../models/Teacherlesson.model';
import { TeacherLessonsService } from '../../services/teacher-lessons.service';
import { LessonsTableComponent } from './components/lessons-table-component/lessons-table-component';
import { LessonsToolbarComponent } from './components/lessons-toolbar-component/lessons-toolbar-component';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-teacher-lessons',
  imports: [
    DecimalPipe,
    TranslatePipe,
    LessonsToolbarComponent,
    LessonsTableComponent,
    PaginatorComponent,
    NgmMotionDirective,
  ],
  templateUrl: './teacher-lessons-component.html',
})
export class TeacherLessonsComponent {
  private readonly service = inject(TeacherLessonsService);
  private readonly dialog = inject(DeleteModalService);

  protected readonly lessons = this.service.lessons;
  protected readonly pageInfo = this.service.page;
  protected readonly counts = this.service.counts;
  protected readonly loading = this.service.loading;
  protected readonly pageSize = PAGE_SIZE;

  // Raw input; the request only sees the debounced value.
  protected readonly searchQuery = signal('');
  protected readonly statusFilter = signal<StatusFilter>('all');
  protected readonly sort = signal<TeacherLessonSort>('newest');

  private readonly debouncedSearch = signal('');
  private readonly pageNumber = signal(1);
  private readonly reloadTick = signal(0);
  protected readonly loadFailed = signal(false);

  protected readonly isFiltered = computed(
    () => this.debouncedSearch() !== '' || this.statusFilter() !== 'all',
  );

  private readonly request = computed(() => ({
    query: {
      search: this.debouncedSearch(),
      status: this.statusFilter(),
      sort: this.sort(),
      page: this.pageNumber(),
      pageSize: PAGE_SIZE,
    },
    tick: this.reloadTick(),
  }));

  public constructor() {
    // Typing waits 300ms; clicks (tabs, sort, pages) go out immediately.
    toObservable(this.searchQuery)
      .pipe(
        debounceTime(300),
        map((q) => q.trim()),
        distinctUntilChanged(),
        takeUntilDestroyed(),
      )
      .subscribe((q) => {
        this.debouncedSearch.set(q);
        this.pageNumber.set(1);
      });

    // switchMap cancels the in-flight request when a newer one starts.
    toObservable(this.request)
      .pipe(
        switchMap(({ query }) =>
          this.service.load(query).pipe(
            catchError(() => {
              this.loadFailed.set(true);
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe(({ lessons }) => {
        this.loadFailed.set(false);
        // Deleted the last row of the last page: step back one page.
        if (lessons.items.length === 0 && lessons.pageNumber > 1) {
          this.pageNumber.set(lessons.pageNumber - 1);
        }
      });
  }

  protected onStatusChange(status: StatusFilter): void {
    this.statusFilter.set(status);
    this.pageNumber.set(1);
  }

  protected onSortChange(sort: TeacherLessonSort): void {
    this.sort.set(sort);
    this.pageNumber.set(1);
  }

  protected onPageChange(page: number): void {
    this.pageNumber.set(page);
  }

  protected onRetry(): void {
    this.reloadTick.update((t) => t + 1);
  }

  protected onToggle(id: number): void {
    this.service.toggleStatus(id);
  }

  protected onDeleteRequest(lesson: TeacherLesson): void {
    this.dialog.confirmDelete(lesson.name).closed.subscribe((confirmed) => {
      if (!confirmed) return;
      this.service.deleteLesson(lesson.id).subscribe(() => this.reloadTick.update((t) => t + 1));
    });
  }
}
