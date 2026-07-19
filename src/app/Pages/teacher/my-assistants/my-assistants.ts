import { Component, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucidePlus, lucideUserPlus } from '@ng-icons/lucide';

import {
  AssistantPermissions,
  CreateOrUpdateAssistantCommandResponse,
  PolicyEnum,
} from './assistants.model';
import { AssistantCard } from './components/assistant-card/assistant-card';
import { AssistantsStore } from './stores/my-assistants.store';
import { CreateAssistantCommand } from './assistants.model';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-my-assistants',
  imports: [NgIcon, AssistantCard, FormsModule],
  templateUrl: './my-assistants.html',
  styleUrl: './my-assistants.css',
  viewProviders: provideIcons({ lucidePlus, lucideCheck, lucideUserPlus }),
})
export class MyAssistants implements OnInit {
  protected readonly store = inject(AssistantsStore);

  readonly assistants = this.store.assistants;
  readonly isLoading = this.store.isLoading;
  readonly isSubmitting = this.store.isSubmitting;
  readonly error = this.store.error;

  isAddFormOpen = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  passwordMismatch = signal(false);

  pendingDeleteAssistant = signal<CreateOrUpdateAssistantCommandResponse | null>(null);

  protected readonly newAssistant = signal({
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    confirmPassword: '',
    email: '',
    permissions: {
      CanEvaluateStudents: false,
      CanManageContent: false,
      CanViewReports: false,
      CanManageAssessments: false,
      CanManageEnrollments: false,
    } satisfies AssistantPermissions,
  });

  removeModal = viewChild<ElementRef<HTMLDialogElement>>('removeModal');

  ngOnInit(): void {
    this.store.loadAssistants();
  }

  toggleFormPermission(permKey: keyof AssistantPermissions): void {
    this.newAssistant.update((data) => ({
      ...data,
      permissions: {
        ...data.permissions,
        [permKey]: !data.permissions[permKey],
      },
    }));
  }

  async togglePermission(id: string, permKey: keyof AssistantPermissions): Promise<void> {
    const assistant = this.assistants().find((a) => a.id === id);
    if (!assistant) return;

    const current = new Set<string>(assistant.policies ?? []);
    current.has(permKey) ? current.delete(permKey) : current.add(permKey);

    await this.store.updatePolicies(id, [...current] as PolicyEnum[]);
    toast.success('الصلاحيات اتعدلت');
  }
  openAddForm(): void {
    this.isAddFormOpen.set(true);
  }

  closeAddForm(): void {
    this.isAddFormOpen.set(false);
    this.resetForm();
  }

  resetForm(): void {
    this.newAssistant.set({
      firstName: '',
      lastName: '',
      phone: '',
      password: '',
      confirmPassword: '',
      email: '',
      permissions: {
        CanEvaluateStudents: false,
        CanManageContent: false,
        CanViewReports: false,
        CanManageAssessments: false,
        CanManageEnrollments: false,
      },
    });
    this.passwordMismatch.set(false);
    this.showPassword.set(false);
    this.showConfirmPassword.set(false);
  }

  async submitForm(): Promise<void> {
    const data = this.newAssistant();

    // Basic validation
    if (!data.firstName || !data.email || !data.password) return;

    if (data.password !== data.confirmPassword) {
      this.passwordMismatch.set(true);
      return;
    }

    // Map permissions object → PolicyEnum[]
    const policies = (Object.keys(data.permissions) as (keyof AssistantPermissions)[])
      .filter((key) => data.permissions[key])
      .map((key) => key as PolicyEnum);

    const command: CreateAssistantCommand = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      phoneNumber: data.phone,
      policies,
    };

    const success = await this.store.addAssistant(command);
    if (success) {
      this.closeAddForm();
      toast.success('تم الإضافة بنجاح');
    }
  }
  getAvatarColor(index: number): { bg: string; text: string } {
    const colors = [
      { bg: 'bg-(--purple)', text: 'text-white' },
      { bg: 'bg-(--mint)', text: 'text-slate-900' },
      { bg: 'bg-(--star)', text: 'text-slate-900' },
      { bg: 'bg-(--coral)', text: 'text-white' },
    ];
    return colors[index % colors.length];
  }

  requestDelete(assistant: CreateOrUpdateAssistantCommandResponse): void {
    this.pendingDeleteAssistant.set(assistant);
    this.removeModal()?.nativeElement.showModal();
  }

  closeDeleteModal(): void {
    this.removeModal()?.nativeElement.close();
    this.pendingDeleteAssistant.set(null);
  }

  async confirmDelete(): Promise<void> {
    const target = this.pendingDeleteAssistant();
    if (!target) return;

    const success = await this.store.deleteAssistant(target.id);
    if (success) {
      this.closeDeleteModal();
      toast.success('تم الحذف');
    }
  }
}
