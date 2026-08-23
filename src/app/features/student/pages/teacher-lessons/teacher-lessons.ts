import {
  Component,
  computed,
  debounced,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  bootstrapSearch,
  bootstrapArrowLeft,
  bootstrapArrowRight,
} from '@ng-icons/bootstrap-icons';
import { Lesson } from '../../../../core/Models/lesson-model';
import { TeacherLessonsStore } from './teacher-lessons-store';
import { LessonCardComponent } from '../lessons/lesson-card/lesson-card';

type FilterKey = 'all' | 'avail' | 'purchased' | 'locked' | 'expired';

@Component({
  selector: 'app-teacher-lessons',
  imports: [RouterModule, FormsModule, NgIcon, LessonCardComponent],
  viewProviders: [
    provideIcons({
      bootstrapSearch,
      bootstrapArrowLeft,
      bootstrapArrowRight,
    }),
  ],
  templateUrl: './teacher-lessons.html',
  styleUrls: ['./teacher-lessons.css'],
})
export class TeacherLessonsComponent {
  private readonly store = inject(TeacherLessonsStore);
  private readonly SEARCH_DEBOUNCE_MS = 400;

  /** Teacher guid coming from the `teachers/:id` route param. */
  readonly id = input.required<string>();

  // Read-only selectors from the signal store
  protected readonly lessons = this.store.lessons;
  protected readonly isLoading = this.store.isLoading;
  protected readonly totalLessons = this.store.totalLessons; // server totalRecords
  protected readonly totalPages = this.store.totalPages;
  protected readonly pageNumber = this.store.pageNumber;
  protected readonly hasNextPage = this.store.hasNextPage;
  protected readonly hasPrevPage = this.store.hasPrevPage;

  // Local UI state
  readonly activeFilter = signal<FilterKey>('all');
  readonly searchQuery = signal('');

  private readonly debouncedSearchQuery = debounced(this.searchQuery, this.SEARCH_DEBOUNCE_MS);

  // Immutable config
  protected readonly filters: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'الكل' },
    { key: 'avail', label: 'متاح' },
    { key: 'purchased', label: 'مشتري' },
    { key: 'locked', label: 'مقفول' },
    { key: 'expired', label: 'منتهي الصلاحية' },
  ];

  constructor() {
    // Load the catalog for the current teacher; also reacts to route param changes.
    effect(() => {
      const teacherId = this.id();
      untracked(() => {
        if (teacherId) this.store.loadLessons(teacherId);
      });
    });

    // Fire the server-side keyword search once the debounced query settles.
    effect(() => {
      const query = this.debouncedSearchQuery.value();
      untracked(() => this.store.setKeyword(query ?? ''));
    });
  }

  /** Teacher name derived from the first loaded lesson (all items share it). */
  protected readonly teacherName = computed(() => this.lessons()[0]?.teacherName ?? 'المدرس');

  /** Chip counters: All = server total, the rest count within the loaded page. */
  protected readonly counts = computed<Record<FilterKey, number>>(() => {
    const list = this.lessons();
    return {
      all: this.totalLessons(),
      avail: list.filter((l) => l.status === 'avail').length,
      purchased: list.filter((l) => l.status === 'purchased').length,
      locked: list.filter((l) => l.status === 'locked').length,
      expired: list.filter((l) => l.status === 'expired').length,
    };
  });

  /** Client-side status filter applied to the currently loaded page. */
  protected readonly filteredLessons = computed<Lesson[]>(() => {
    const list = this.lessons();
    const filter = this.activeFilter();
    return filter === 'all' ? list : list.filter((l) => l.status === filter);
  });

  setFilter(filter: FilterKey): void {
    this.activeFilter.set(filter);
  }

  goToPage(page: number): void {
    this.store.goToPage(page);
  }

  nextPage(): void {
    this.store.nextPage();
  }

  prevPage(): void {
    this.store.prevPage();
  }
}
