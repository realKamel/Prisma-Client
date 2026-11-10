import {
  Component,
  ElementRef,
  OnInit,
  computed,
  inject,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { bootstrapSearch } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { AuthStoreService } from '../../../../../core/services/auth/auth-store.service';
// TODO: adjust to wherever your shared Pagination component lives
import { Pagination } from '../../../components/pagination/pagination';
import { Teacher, TeacherFilterKey } from '../../../../student/models/teacher.model';
import { TeacherCardComponent } from './teacher-card/teacher-card';
import { TeacherCatalogStore } from './teacher-store';

/** The model's filter keys plus the local "teaches my year" filter. */
type ListFilterKey = TeacherFilterKey | 'myYear';

const PAGE_SIZE = 9;

/** Makes Arabic search forgiving: drops diacritics and unifies common letter variants. */
const normalize = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .trim();

@Component({
  selector: 'app-teacher-list',
  imports: [RouterModule, FormsModule, NgIcon, TeacherCardComponent, Pagination, NgmMotionDirective],
  viewProviders: [provideIcons({ bootstrapSearch })],
  templateUrl: './teacher-list.html',
  styleUrls: ['./teacher-list.css'],
})
export class TeacherListPageComponent implements OnInit {
  private readonly store = inject(TeacherCatalogStore);
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthStoreService);

  private readonly listTop = viewChild<ElementRef<HTMLElement>>('listTop');

  // The full list (the catalog is small, so everything is loaded once)
  protected readonly teachers = this.store.teachers;
  protected readonly isLoading = this.store.isLoading;
  protected readonly error = this.store.error;
  /** Null when logged out — hides every "teaches my year" feature. */
  protected readonly studentCurrentYear = this.store.studentCurrentYear;

  // Local UI state
  protected readonly searchQuery = signal('');
  protected readonly activeFilter = signal<ListFilterKey>('all');

  /** Jumps back to page 1 whenever the search text or the filter changes. */
  protected readonly currentPage = linkedSignal({
    source: () => `${this.searchQuery()}|${this.activeFilter()}`,
    computation: () => 1,
  });

  protected readonly filters = computed<{ key: ListFilterKey; label: string }[]>(() => {
    const base: { key: ListFilterKey; label: string }[] = [
      { key: 'all', label: 'الكل' },
      { key: 'featured', label: 'مميز' },
    ];
    return this.studentCurrentYear() != null
      ? [...base, { key: 'myYear', label: 'يدرّس سنتي' }]
      : base;
  });

  private readonly searched = computed<Teacher[]>(() => {
    const query = normalize(this.searchQuery());
    const list = this.teachers();
    if (!query) return list;
    return list.filter((t) =>
      normalize(`${t.firstName} ${t.secondName} ${t.subject ?? ''}`).includes(query),
    );
  });

  /** Teachers who teach the student's year come first (the sort is stable). */
private readonly sorted = computed<Teacher[]>(() => {
  const list = this.searched();
  if (this.studentCurrentYear() == null) return list;
  return [...list].sort(
    (a, b) => Number(this.teachesMyYear(b)) - Number(this.teachesMyYear(a)),
  );
});

/** Chip counts follow the current search, so they always match what the grid can show. */
protected readonly counts = computed<Record<ListFilterKey, number>>(() => {
  const list = this.searched();
  return {
    all: list.length,
    featured: list.filter((t) => t.featured).length,
    myYear: list.filter((t) => this.teachesMyYear(t)).length,
  };
});

protected readonly filteredTeachers = computed<Teacher[]>(() => {
  const list = this.sorted();
  switch (this.activeFilter()) {
    case 'featured':
      return list.filter((t) => t.featured);
    case 'myYear':
      return list.filter((t) => this.teachesMyYear(t));
    default:
      return list;
  }
});

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredTeachers().length / PAGE_SIZE)),
  );

  protected readonly pagesArray = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1),
  );

  protected readonly pagedTeachers = computed<Teacher[]>(() => {
    const start = (this.currentPage() - 1) * PAGE_SIZE;
    return this.filteredTeachers().slice(start, start + PAGE_SIZE);
  });

  protected readonly hasActiveFilters = computed(
    () => this.searchQuery().trim() !== '' || this.activeFilter() !== 'all',
  );

  public ngOnInit(): void {
    this.store.loadTeachers();
  }

  protected retry(): void {
    this.store.loadTeachers();
  }

  protected setFilter(filter: ListFilterKey): void {
    this.activeFilter.set(filter);
  }

  protected resetFilters(): void {
    this.searchQuery.set('');
    this.activeFilter.set('all');
  }

  protected goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.listTop()?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /** Card output → teacher profile page. */
  protected onViewTeacher(teacher: Teacher): void {
    void this.router.navigate(['/teacher', teacher.id, 'profile']);
  }

  /** Card output → teacher lesson catalog. */
  protected onViewLessons(teacher: Teacher): void {
    void this.router.navigate(['/teachers', teacher.id, 'lessons']);
  }

  /** True when the teacher teaches the signed-in student's current year (matched by id). */
  private teachesMyYear(teacher: Teacher): boolean {
    const yearId = this.studentCurrentYear()?.id;
    return !!yearId && (teacher.academicYears ?? []).some((y) => y.id === yearId);
  }
}