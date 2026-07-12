import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MyAssistantsService } from '../my-assistants-service';
import {
  CreateAssistantCommand,
  CreateOrUpdateAssistantCommandResponse,
  PolicyEnum,
} from '../assistants.model';

@Injectable({ providedIn: 'root' })
export class AssistantsStore {
  private readonly _service = inject(MyAssistantsService);
  private readonly _assistants = signal<CreateOrUpdateAssistantCommandResponse[]>([]);
  private readonly _selectedAssistant = signal<CreateOrUpdateAssistantCommandResponse | null>(null);
  private readonly _isLoading = signal(false);
  private readonly _isSubmitting = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly assistants = this._assistants.asReadonly();
  readonly selectedAssistant = this._selectedAssistant.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly isSubmitting = this._isSubmitting.asReadonly();
  readonly error = this._error.asReadonly();

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
      const response = await firstValueFrom(this._service.GetAssistantsAsync());
      if (response.succeeded) {
        this._assistants.set(response.data ?? []);
      } else {
        this._error.set(response.message ?? 'Failed to load assistants');
      }
    } catch (err) {
      this._error.set(this._extractMessage(err));
    } finally {
      this._isLoading.set(false);
    }
  }

  async addAssistant(command: CreateAssistantCommand): Promise<boolean> {
    this._isSubmitting.set(true);
    this._error.set(null);
    try {
      const response = await firstValueFrom(this._service.AddAssistantAsync(command));
      if (response.succeeded && response.data) {
        const user: CreateOrUpdateAssistantCommandResponse = {
          id: response.data.id,
          email: response.data.email,
          firstName: response.data.firstName,
          phoneNumber: response.data.phoneNumber,
          policies: response.data.policies,
          secondName: response.data.secondName,
        };
        this._assistants.update((list) => [...list, user]);
        return true;
      }
      this._error.set(response.message ?? 'Failed to add assistant');
      return false;
    } catch (err) {
      this._error.set(this._extractMessage(err));
      return false;
    } finally {
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

  async updatePolicies(id: string, policies: PolicyEnum[]): Promise<boolean> {
    this._isSubmitting.set(true);
    this._error.set(null);
    try {
      const response = await firstValueFrom(this._service.updatePoliciesAsync(id, policies));
      if (response.succeeded && response.data) {
        const updated = { ...response.data };
        this._assistants.update((list) => list.map((a) => (a.id === id ? updated : { ...a })));
        if (this._selectedAssistant()?.id === id) this._selectedAssistant.set(updated);

        return true;
      }
      this._error.set(response.message ?? 'Failed to update policies');
      return false;
    } catch (err) {
      this._error.set(this._extractMessage(err));
      return false;
    } finally {
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
    this._error.set(null);
  }

  private _extractMessage(err: unknown): string {
    return err instanceof Error ? err.message : 'An unexpected error occurred';
  }
}
