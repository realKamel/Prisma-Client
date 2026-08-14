import { computed, inject, Service, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { MyAssistantsService } from '../my-assistants-service';
import { IProblemDetails } from '../../../../../core/Models/problemDetails';
import {
  CreateAssistantCommand,
  CreateOrUpdateAssistantCommandResponse,
  PolicyEnum,
  UpdateAssistantCommand,
} from '../assistants.model';

@Service()
export class AssistantsStore {
  private readonly _service = inject(MyAssistantsService);
  private readonly _assistants = signal<CreateOrUpdateAssistantCommandResponse[]>([]);
  private readonly _selectedAssistant = signal<CreateOrUpdateAssistantCommandResponse | null>(null);
  private readonly _isLoading = signal(false);
  private readonly _isSubmitting = signal(false);
  private readonly _updatingAssistantId = signal<string | null>(null);
  private readonly _updatingPolicy = signal<PolicyEnum | null>(null);
  private readonly _error = signal<string | null>(null);
  private readonly _lastProblem = signal<IProblemDetails | null>(null);

  readonly assistants = this._assistants.asReadonly();
  readonly selectedAssistant = this._selectedAssistant.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly isSubmitting = this._isSubmitting.asReadonly();
  readonly updatingAssistantId = this._updatingAssistantId.asReadonly();
  readonly updatingPolicy = this._updatingPolicy.asReadonly();
  readonly error = this._error.asReadonly();
  readonly lastProblem = this._lastProblem.asReadonly();

  readonly isUpdating = computed(() => this._updatingAssistantId() !== null);

  readonly totalAssistants = computed(() => this._assistants().length);
  readonly hasAssistants = computed(() => this._assistants().length > 0);
  readonly isBusy = computed(() => this._isLoading() || this._isSubmitting());
  readonly selectedAssistantPolicies = computed(
    () => (this._selectedAssistant()?.policies as PolicyEnum[]) ?? [],
  );

  async loadAssistants(): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);
    try {
      const data = await firstValueFrom(this._service.GetAssistantsAsync());
      this._assistants.set(data ?? []);
    } catch (err) {
      this._error.set(this._extractMessage(err));
    } finally {
      this._isLoading.set(false);
    }
  }

  async addAssistant(command: CreateAssistantCommand): Promise<boolean> {
    this._isSubmitting.set(true);
    this._error.set(null);
    this._lastProblem.set(null);
    try {
      const data = await firstValueFrom(this._service.AddAssistantAsync(command));
      if (data) {
        const user: CreateOrUpdateAssistantCommandResponse = {
          id: data.id,
          email: data.email,
          firstName: data.firstName,
          phoneNumber: data.phoneNumber,
          policies: data.policies,
          secondName: data.secondName,
        };
        this._assistants.update((list) => [...list, user]);
        return true;
      }
      this._error.set('Failed to add assistant');
      return false;
    } catch (err) {
      this._lastProblem.set(this._extractProblem(err));
      this._error.set(this._hasFieldErrors(err) ? null : this._extractMessage(err));
      return false;
    } finally {
      this._isSubmitting.set(false);
    }
  }

  async updateAssistant(id: string, command: UpdateAssistantCommand): Promise<boolean> {
    this._isSubmitting.set(true);
    this._updatingAssistantId.set(id);
    this._error.set(null);
    this._lastProblem.set(null);
    try {
      const updated = await firstValueFrom(this._service.UpdateAssistantAsync(id, command));
      if (updated) {
        this._assistants.update((list) => list.map((a) => (a.id === id ? updated : { ...a })));
        if (this._selectedAssistant()?.id === id) this._selectedAssistant.set(updated);
        return true;
      }
      this._error.set('Failed to update assistant');
      return false;
    } catch (err) {
      this._lastProblem.set(this._extractProblem(err));
      this._error.set(this._hasFieldErrors(err) ? null : this._extractMessage(err));
      return false;
    } finally {
      this._updatingAssistantId.set(null);
      this._updatingPolicy.set(null);
      this._isSubmitting.set(false);
    }
  }

  async deleteAssistant(id: string): Promise<boolean> {
    this._isSubmitting.set(true);
    this._error.set(null);
    try {
      await firstValueFrom(this._service.deletedAssistantAsync(id));
      this._assistants.update((list) => list.filter((a) => a.id !== id));
      if (this._selectedAssistant()?.id === id) {
        this._selectedAssistant.set(null);
      }
      return true;
    } catch (err) {
      this._error.set(this._extractMessage(err));
      return false;
    } finally {
      this._isSubmitting.set(false);
    }
  }

  async updatePolicies(id: string, policies: PolicyEnum[], policy?: PolicyEnum): Promise<boolean> {
    this._isSubmitting.set(true);
    this._updatingAssistantId.set(id);
    this._updatingPolicy.set(policy ?? null);
    this._error.set(null);
    try {
      const updated = await firstValueFrom(this._service.updatePoliciesAsync(id, policies));
      if (updated) {
        this._assistants.update((list) => list.map((a) => (a.id === id ? updated : { ...a })));
        if (this._selectedAssistant()?.id === id) this._selectedAssistant.set(updated);

        return true;
      }
      this._error.set('Failed to update policies');
      return false;
    } catch (err) {
      this._error.set(this._extractMessage(err));
      return false;
    } finally {
      this._updatingAssistantId.set(null);
      this._updatingPolicy.set(null);
      this._isSubmitting.set(false);
    }
  }

  selectAssistant(assistant: CreateOrUpdateAssistantCommandResponse | null): void {
    this._selectedAssistant.set(assistant);
  }

  clearError(): void {
    this._error.set(null);
  }

  reset(): void {
    this._assistants.set([]);
    this._selectedAssistant.set(null);
    this._isLoading.set(false);
    this._isSubmitting.set(false);
    this._updatingAssistantId.set(null);
    this._updatingPolicy.set(null);
    this._error.set(null);
    this._lastProblem.set(null);
  }

  private _extractMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const problem = err.error as IProblemDetails | undefined;
      return problem?.detail || problem?.title || err.message;
    }
    return err instanceof Error ? err.message : 'An unexpected error occurred';
  }

  private _extractProblem(err: unknown): IProblemDetails | null {
    if (err instanceof HttpErrorResponse && !(err.error instanceof ErrorEvent)) {
      return (err.error as IProblemDetails | undefined) ?? null;
    }
    return null;
  }

  private _hasFieldErrors(err: unknown): boolean {
    return !!this._extractProblem(err)?.errors;
  }
}
