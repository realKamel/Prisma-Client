import { computed, inject, Service, signal } from '@angular/core';
import { DashboardState, GraphState } from '../models/dashboard.model';
import { TeacherServices } from '../services/teacher-service';
import { finalize } from 'rxjs';

@Service()
export class TeacherStore {
  private readonly api = inject(TeacherServices);

  private state = signal<DashboardState>({ data: null, loading: false, error: null });
  private graphState = signal<GraphState>({ data: null, loading: false, error: null });

  // ---- Main dashboard ---------------------------------------------------------------------------
  readonly data = computed(() => this.state().data);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  readonly stats = computed(() => this.data()?.stats ?? null);
  readonly bestSales = computed(() => this.data()?.bestSales ?? []);
  readonly recentSales = computed(() => this.data()?.recentSales ?? []);
  readonly attention = computed(() => this.data()?.attention ?? null);
  readonly logs = computed(() => this.data()?.logs ?? []);

  // ---- Graph (separate request, cached on the server) -------------------------------------------
  readonly graph = computed(() => this.graphState().data);
  readonly graphLoading = computed(() => this.graphState().loading);
  readonly graphError = computed(() => this.graphState().error);

  readonly earnings = computed(() => this.graph()?.earnings ?? null);
  readonly graphStats = computed(() => this.graph()?.stats ?? null);

  loadDashboardStatus(): void {
    // Prevent double-fetching if already loading
    if (this.state().loading) return;

    this.updateState({ loading: true, error: null });

    this.api
      .GetDashboardData()
      .pipe(finalize(() => this.updateState({ loading: false })))
      .subscribe({
        next: (data) => this.updateState({ data, error: null }),
        error: (err) =>
          this.updateState({ error: err.message || 'Failed to load dashboard data.' }),
      });
  }

  loadDashboardGraph(): void {
    if (this.graphState().loading) return;

    this.updateGraphState({ loading: true, error: null });

    this.api
      .GetDashboardGraphData()
      .pipe(finalize(() => this.updateGraphState({ loading: false })))
      .subscribe({
        next: (data) => this.updateGraphState({ data, error: null }),
        error: (err) =>
          this.updateGraphState({ error: err.message || 'Failed to load dashboard graph.' }),
      });
  }

  reset(): void {
    this.state.set({ data: null, loading: false, error: null });
    this.graphState.set({ data: null, loading: false, error: null });
  }

  private updateState(partialState: Partial<DashboardState>): void {
    this.state.update((current) => ({ ...current, ...partialState }));
  }

  private updateGraphState(partialState: Partial<GraphState>): void {
    this.graphState.update((current) => ({ ...current, ...partialState }));
  }
}