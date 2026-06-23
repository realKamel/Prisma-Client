import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { Assistant, AssistantPermissions } from './assistants.model';
import { MyAssistantsService } from './my-assistants-service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucidePlus, lucideUserPlus } from '@ng-icons/lucide';
import { AssistantCard } from './components/assistant-card/assistant-card';
import { email } from '@angular/forms/signals';

@Component({
  selector: 'app-my-assistants',
  imports: [CommonModule, FormsModule, NgIcon, AssistantCard],
  templateUrl: './my-assistants.html',
  styleUrl: './my-assistants.css',
  viewProviders: provideIcons({ lucidePlus, lucideCheck, lucideUserPlus }),
})
export class MyAssistants {
  private assistantService = inject(MyAssistantsService);

  // Accessing reactive template state directly
  assistants = this.assistantService.assistants;

  // Modals and Visibility state signals
  isAddFormOpen = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  passwordMismatch = signal(false);

  // Track helper for deletion modal
  pendingDeleteAssistant = signal<Assistant | null>(null);

  // Form State Bindings
  protected readonly newAssistant = signal({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    email: '',
    permissions: {
      CanEvaluateStudents: true,
      CanManageContent: false,
      CanViewReports: false,
      CanManageAssessments: true,
      CanManageEnrollments: false,
    },
  });

  // Native HTML5 dialog wrapper query via Angular viewChild signal
  removeModal = viewChild<ElementRef<HTMLDialogElement>>('removeModal');

  togglePermission(id: number, permKey: keyof AssistantPermissions) {
    this.assistantService.togglePermission(id, permKey);
  }

  openAddForm() {
    this.isAddFormOpen.set(true);
  }

  closeAddForm() {
    this.isAddFormOpen.set(false);
    this.resetForm();
  }

  resetForm() {
    this.newAssistant.set({
      name: '',
      phone: '',
      password: '',
      confirmPassword: '',
      email: '',
      permissions: {
        CanEvaluateStudents: true,
        CanManageContent: false,
        CanViewReports: false,
        CanManageAssessments: true,
        CanManageEnrollments: false,
      },
    });
    this.passwordMismatch.set(false);
    this.showPassword.set(false);
    this.showConfirmPassword.set(false);
  }

  submitForm() {
    const data = this.newAssistant();
    if (!data.name || !data.password) return;

    if (data.password !== data.confirmPassword) {
      this.passwordMismatch.set(true);
      return;
    }

    this.assistantService.addAssistant({
      name: data.name,
      phone: data.phone,
      permissions: data.permissions,
    });

    this.closeAddForm();
  }

  getAvatarColor(id: number, name: string): { bg: string; text: string } {
    const initials = name[0];
    const colors = [
      { bg: 'bg-[var(--purple,#8b5cf6)]', text: 'text-white' },
      { bg: 'bg-[var(--mint,#10b981)]', text: 'text-slate-900' },
      { bg: 'bg-[var(--star,#f59e0b)]', text: 'text-slate-900' },
      { bg: 'bg-[var(--coral,#ef4444)]', text: 'text-white' },
    ];
    return colors[id % colors.length];
  }

  // --- Deletion Dialog Management ---
  requestDelete(assistant: Assistant) {
    this.pendingDeleteAssistant.set(assistant);
    this.removeModal()?.nativeElement.showModal();
  }

  closeDeleteModal() {
    this.removeModal()?.nativeElement.close();
    this.pendingDeleteAssistant.set(null);
  }

  confirmDelete() {
    const target = this.pendingDeleteAssistant();
    if (target) {
      this.assistantService.removeAssistant(target.id);
    }
    this.closeDeleteModal();
  }
}
