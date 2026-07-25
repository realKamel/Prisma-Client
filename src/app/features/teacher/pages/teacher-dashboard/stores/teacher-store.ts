import { computed, inject, Service, signal } from '@angular/core';
import { Action, DashboardState } from '../models/dashboard.model';
import { TeacherServices } from '../services/teacher-services';
import { finalize } from 'rxjs';

@Service()
export class TeacherStore {
  private readonly api = inject(TeacherServices);
  private state = signal<DashboardState>({
    data: null,
    loading: false,
    error: null,
  });

  // 2. Public read-only signals for components to select from
  readonly data = computed(() => this.state().data);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  // High-level slices commonly used by the UI
  readonly stats = computed(() => this.data()?.stats ?? null);
  readonly weekEarnings = computed(() => this.data()?.weekEarnings ?? null);
  readonly bestSales = computed(() => this.data()?.bestSales ?? []);
  readonly logs = computed(() => this.data()?.logs ?? []);
  readonly arTranslatedLogs = computed(() =>
    this.data()?.logs.map((x) => {
      if (x.action == Action.CREATE) {
        x.action = 'تم اضافة';
      } else if (x.action == Action.UPDATE) {
        x.action = 'تم تعديل';
      } else if (x.action == Action.DELETE) {
        x.action = 'تم حذف';
      } else {
        x.action = 'تم عملية';
      }
      return x;
    }),
  );

  loadDashboardStatus(): void {
    // Prevent double-fetching if already loading
    if (this.state().loading) return;

    this.updateState({ loading: true, error: null });

    this.api
      .GetDashboardData()
      .pipe(finalize(() => this.updateState({ loading: false })))
      .subscribe({
        next: ({ data }) => this.updateState({ data, error: null }),
        error: (err) =>
          this.updateState({ error: err.message || 'Failed to load dashboard data.' }),
      });
  }

  reset(): void {
    this.state.set({
      data: null,
      loading: false,
      error: null,
    });
  }

  private updateState(partialState: Partial<DashboardState>): void {
    this.state.update((current) => ({
      ...current,
      ...partialState,
    }));
  }
}
