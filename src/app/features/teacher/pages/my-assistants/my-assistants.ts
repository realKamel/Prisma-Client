import { Component, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucidePlus, lucideUserPlus } from '@ng-icons/lucide';
import { toast } from 'ngx-sonner';

import { AppValidators } from '../../../../shared/validators/phone-number-validator';
import { applyServerErrors, serverErrorOf } from '../../../../shared/validators/server-errors';
import {
  AssistantPermissions,
  CreateAssistantCommand,
  CreateOrUpdateAssistantCommandResponse,
  PolicyEnum,
  UpdateAssistantCommand,
} from './assistants.model';
import { AssistantCard } from './components/assistant-card/assistant-card';
import { AssistantsStore } from './stores/my-assistants.store';

@Component({
  selector: 'app-my-assistants',
  imports: [NgIcon, AssistantCard, ReactiveFormsModule],
  templateUrl: './my-assistants.html',
  styleUrl: './my-assistants.css',
  viewProviders: provideIcons({ lucidePlus, lucideCheck, lucideUserPlus }),
})
export class MyAssistantsPage implements OnInit {
  protected readonly store = inject(AssistantsStore);
  private readonly fb = inject(FormBuilder);

  protected readonly assistants = this.store.assistants;
  protected readonly isLoading = this.store.isLoading;
  protected readonly isSubmitting = this.store.isSubmitting;
  protected readonly isUpdating = this.store.isUpdating;
  protected readonly updatingAssistantId = this.store.updatingAssistantId;
  protected readonly updatingPolicy = this.store.updatingPolicy;
  protected readonly error = this.store.error;

  protected readonly isAddFormOpen = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly showConfirmPassword = signal(false);
  /** General error surfaced when the API returned errors with no matching field. */
  protected readonly formError = signal<string | null>(null);

  protected readonly pendingDeleteAssistant = signal<CreateOrUpdateAssistantCommandResponse | null>(
    null,
  );

  protected readonly editTarget = signal<CreateOrUpdateAssistantCommandResponse | null>(null);

  protected readonly form: FormGroup = this.fb.group(
    {
      firstName: ['', [Validators.required, AppValidators.nameValidator]],
      secondName: ['', [AppValidators.nameValidator]],
      phone: ['', [AppValidators.egyptianPhoneNumber]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [AppValidators.optionalPasswordValidator]],
      confirmPassword: ['', AppValidators.optionalPasswordValidator],
      permissions: this.fb.group({
        CanEvaluateStudents: [false],
        CanManageContent: [false],
        CanViewReports: [false],
        CanManageAssessments: [false],
        CanManageEnrollments: [false],
      }),
    },
    { validators: [AppValidators.passwordMatchValidator] },
  );

  /** Stable reference to the form controls, used by the template. */
  protected readonly f = this.form.controls;

  /** Template helper: reads the API validation message set on a control. */
  protected readonly serverErrorOf = serverErrorOf;

  protected readonly removeModal = viewChild<ElementRef<HTMLDialogElement>>('removeModal');

  ngOnInit(): void {
    this.store.loadAssistants();
  }

  async togglePermission(id: string, permKey: keyof AssistantPermissions): Promise<void> {
    const assistant = this.assistants().find((a) => a.id === id);
    if (!assistant) return;

    const current = new Set<string>(assistant.policies ?? []);
    if (current.has(permKey)) {
      current.delete(permKey);
    } else {
      current.add(permKey);
    }

    await this.store.updatePolicies(id, [...current] as PolicyEnum[], permKey as PolicyEnum);
    toast.success('الصلاحيات اتعدلت');
  }
  openAddForm(): void {
    this.editTarget.set(null);
    this.isAddFormOpen.set(true);
  }

  closeAddForm(): void {
    this.isAddFormOpen.set(false);
    this.resetForm();
  }

  resetForm(): void {
    this.form.reset({
      firstName: '',
      secondName: '',
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
    this.formError.set(null);
    this.showPassword.set(false);
    this.showConfirmPassword.set(false);
  }

  async submitForm(): Promise<void> {
    const data = this.form.getRawValue();

    // Map permissions object → PolicyEnum[]
    const policies = (Object.keys(data.permissions) as (keyof AssistantPermissions)[])
      .filter((key) => data.permissions[key])
      .map((key) => key as PolicyEnum);

    const command: CreateAssistantCommand = {
      firstName: data.firstName,
      secondName: data.secondName,
      email: data.email,
      password: data.password,
      phoneNumber: data.phone,
      policies,
    };

    const success = await this.store.addAssistant(command);
    if (success) {
      this.closeAddForm();
      toast.success('تم الإضافة بنجاح');
    } else {
      this.applyServerErrors();
    }
  }

  openEditForm(assistant: CreateOrUpdateAssistantCommandResponse): void {
    const policies = new Set<string>(assistant.policies ?? []);
    this.form.reset({
      firstName: assistant.firstName ?? '',
      secondName: assistant.secondName ?? '',
      phone: assistant.phoneNumber ?? '',
      email: assistant.email ?? '',
      password: '',
      confirmPassword: '',
      permissions: {
        CanEvaluateStudents: policies.has(PolicyEnum.CanEvaluateStudents),
        CanManageContent: policies.has(PolicyEnum.CanManageContent),
        CanViewReports: policies.has(PolicyEnum.CanViewReports),
        CanManageAssessments: policies.has(PolicyEnum.CanManageAssessments),
        CanManageEnrollments: policies.has(PolicyEnum.CanManageEnrollments),
      },
    });
    this.formError.set(null);
    this.showPassword.set(false);
    this.showConfirmPassword.set(false);
    this.isAddFormOpen.set(false);
    this.editTarget.set(assistant);
  }

  closeEditForm(): void {
    this.editTarget.set(null);
    this.resetForm();
  }

  async submitEditForm(): Promise<void> {
    const target = this.editTarget();
    if (!target) return;

    const data = this.form.getRawValue();

    const policies = (Object.keys(data.permissions) as (keyof AssistantPermissions)[])
      .filter((key) => data.permissions[key])
      .map((key) => key as PolicyEnum);

    const command: UpdateAssistantCommand = {
      firstName: data.firstName,
      secondName: data.secondName,
      email: data.email,
      phoneNumber: data.phone,
      password: data.password?.trim() ? data.password : undefined,
      policies,
    };

    const success = await this.store.updateAssistant(target.id, command);
    if (success) {
      this.closeEditForm();
      toast.success('تم تحديث بيانات المساعد');
    } else {
      this.applyServerErrors();
    }
  }

  /**
   * Maps the API's ProblemDetails field errors onto the form controls so they
   * render inline under each field (via serverErrorOf / fieldError). Errors with
   * no matching control are surfaced as a general banner.
   */
  private applyServerErrors(): void {
    const problem = this.store.lastProblem();
    const unmapped = applyServerErrors(this.form, problem);
    this.formError.set(unmapped.length ? (problem?.detail ?? problem?.title ?? null) : null);
  }

  /**
   * Returns the inline error message for a field: the server message first
   * (from ProblemDetails), otherwise the first client-side validation error.
   */
  protected fieldError(field: string): string | null {
    const server = serverErrorOf(this.form.get(field));
    if (server) return server;

    const control = this.form.get(field);
    if (!control || !control.touched) return null;
    const errors = control.errors;
    if (!errors) return null;

    if (errors['required']) return 'هذا الحقل مطلوب';
    if (errors['email']) return 'أدخل بريداً إلكترونياً صحيحاً';
    if (errors['invalidName']) return 'الاسم يجب أن يحتوي على حروف فقط';
    if (errors['strongPassword']) return 'أدخل رقم موبايل مصري صحيح';
    if (
      errors['minlength'] ||
      errors['missingUppercase'] ||
      errors['missingLowercase'] ||
      errors['missingDigit'] ||
      errors['missingSpecial']
    ) {
      return 'كلمة المرور ضعيفة (8+ أحرف، حروف كبيرة وصغيرة، رقم، رمز)';
    }
    return null;
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
