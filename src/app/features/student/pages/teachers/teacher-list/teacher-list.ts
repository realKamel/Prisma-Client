import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  effect,
  debounced,
  untracked,
} from '@angular/core';

import { Router, RouterModule } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  bootstrapSearch,
  bootstrapArrowLeft,
  bootstrapArrowRight,
} from '@ng-icons/bootstrap-icons';
import { Teacher, TeacherFilterKey } from '../../../../../core/Models/Student/teacher.model';
import { TeacherCatalogStore } from './teacher-store';
import { TeacherCardComponent } from './teacher-card/teacher-card';
import { FormsModule } from '@angular/forms';
import { AuthStoreService } from '../../../../../core/Services/auth-store.service';

@Component({
  selector: 'app-teacher-list',
  imports: [RouterModule, FormsModule, NgIcon, TeacherCardComponent],
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
export class TeacherList implements OnInit {
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

  // ── Local UI state ──────────────────────────────────────────────────────
  readonly activeFilter = signal<TeacherFilterKey>('all');
  readonly searchQuery = signal('');

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

  ngOnInit(): void {
    this.store.loadTeachers();
  }

  setFilter(filter: TeacherFilterKey): void {
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

  /** Handles the dumb card's "view profile" output. */
  onViewTeacher(): void {
    // TODO: navigate to a dedicated teacher profile route when it exists.
    // For now we drop the student into the lessons catalog of that subject.
    this.router.navigate(['/lessons']);
  }
}
