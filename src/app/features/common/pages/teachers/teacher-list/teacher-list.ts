import {
  Component,
  OnInit,
  computed,
  debounced,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  bootstrapArrowLeft,
  bootstrapArrowRight,
  bootstrapSearch,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { Teacher, TeacherFilterKey } from '../../../../../core/Models/Student/teacher.model';
import { AuthStoreService } from '../../../../../core/Services/auth-store.service';
import { TeacherCardComponent } from './teacher-card/teacher-card';
import { TeacherCatalogStore } from './teacher-store';

@Component({
  selector: 'app-teacher-list',
  imports: [RouterModule, FormsModule, NgIcon, TeacherCardComponent, NgmMotionDirective],
  viewProviders: [
    provideIcons({
      bootstrapSearch,
      bootstrapArrowLeft,
      bootstrapArrowRight,
    }),
  ],
  templateUrl: './teacher-list.html',
  styleUrls: ['./teacher-list.css'],
})
export class TeacherListPageComponent implements OnInit {
  private readonly store = inject(TeacherCatalogStore);
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthStoreService);
  private readonly SEARCH_DEBOUNCE_MS = 400;

  // Read-only selectors from the signal store
  protected readonly teachers = this.store.teachers;
  protected readonly isLoading = this.store.isLoading;
  protected readonly totalTeachers = this.store.totalTeachers; // server totalRecords
  protected readonly totalPages = this.store.totalPages;
  protected readonly pageNumber = this.store.pageNumber;
  protected readonly totalRecords = this.store.totalRecords;
  protected readonly hasNextPage = this.store.hasNextPage;
  protected readonly hasPrevPage = this.store.hasPrevPage;
  protected readonly featuredCount = this.store.featuredCount;

  //Local UI state
  protected readonly activeFilter = signal<TeacherFilterKey>('all');
  protected readonly searchQuery = signal('');

  private readonly debouncedSearchQuery = debounced(this.searchQuery, this.SEARCH_DEBOUNCE_MS);

  // Immutable config
  protected readonly filters: { key: TeacherFilterKey; label: string }[] = [
    { key: 'all', label: 'الكل' },
    { key: 'featured', label: 'مميز' },
  ];

  constructor() {
    // Fire the server-side search once the debounced query settles.
    // `untracked` keeps this effect watching ONLY the debounced query, so the
    // store's internal state writes (loading flag, response, pageNumber) can't
    // re-trigger it and cause a request loop.
    effect(() => {
      const query = this.debouncedSearchQuery.value();
      untracked(() => this.store.setSearch(query));
    });
  }

  protected readonly counts = computed<Record<TeacherFilterKey, number>>(() => ({
    all: this.totalTeachers(),
    featured: this.featuredCount(),
  }));

  protected readonly filteredTeachers = computed<Teacher[]>(() => {
    const list = this.teachers();
    const filter = this.activeFilter();
    return filter === 'all' ? list : list.filter((t) => t.featured);
  });

  public ngOnInit(): void {
    this.store.loadTeachers();
  }

  protected setFilter(filter: TeacherFilterKey): void {
    this.activeFilter.set(filter);
  }

  protected goToPage(page: number): void {
    this.store.goToPage(page);
  }

  protected nextPage(): void {
    this.store.nextPage();
  }

  protected prevPage(): void {
    this.store.prevPage();
  }

  /** Handles the dumb card's "view profile" output → teacher profile page. */
  protected onViewTeacher(teacher: Teacher): void {
    void this.router.navigate(['/teacher', teacher.id, 'profile']);
  }

  /** Handles the dumb card's "lessons" output → teacher lesson catalog. */
  protected onViewLessons(teacher: Teacher): void {
    void this.router.navigate(['/teachers', teacher.id, 'lessons']);
  }
}
