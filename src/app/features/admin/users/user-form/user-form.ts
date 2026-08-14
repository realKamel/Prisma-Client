import { Component, DestroyRef, OnInit, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  TeacherOption,
  GradeOption,
  CreateUserPayload,
  UpdateUserPayload,
} from '../../../../core/Models/Admin/User.model';
import { UserService } from '../../../../core/Services/user.service';
import { IProblemDetails } from '../../../../core/Models/problemDetails';
import { AppRole } from '../../../../core/enums/role-enum';
import { AppValidators } from '../../../../shared/validators/phone-number-validator';
import { applyServerErrors, serverErrorOf } from '../../../../shared/validators/server-errors';
import { rxResource, takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-user-form',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './user-form.html',
})
export class UserFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly userService = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);

  // ── Route / edit state ────────────────────────────────────────────────────
  protected readonly isEditMode = signal(false);
  protected readonly editUserId = signal<string | null>(null);
  protected readonly loadingUser = signal(false);

  // ── Teacher / grade dropdown options (async) ─────────────────────────────
  protected readonly optionsResource = rxResource({
    stream: () =>
      forkJoin({
        teachers: this.userService.getTeacherOptions(),
        grades: this.userService.getGradeOptions(),
      }),
  });
  protected readonly teacherOptions = computed<TeacherOption[]>(
    () => this.optionsResource.value()?.teachers ?? [],
  );
  protected readonly gradeOptions = computed<GradeOption[]>(
    () => this.optionsResource.value()?.grades ?? [],
  );
  protected readonly loadingOptions = computed(() => this.optionsResource.isLoading());

  protected readonly form: FormGroup = this.fb.group(
    {
      firstName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(20),
          AppValidators.nameValidator,
        ],
      ],
      secondName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(20),
          AppValidators.nameValidator,
        ],
      ],
      thirdName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(20),
          AppValidators.nameValidator,
        ],
      ],
      lastName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(20),
          AppValidators.nameValidator,
        ],
      ],
      mobile: ['', [Validators.required, AppValidators.egyptianPhoneNumber]],
      email: ['', [Validators.required, Validators.maxLength(254), AppValidators.gmailValidator]],
      password: ['', [Validators.required, AppValidators.passwordValidator]],
      confirmPassword: ['', [Validators.required]],
      role: ['', Validators.required],
      gradeId: [null],
      teacherId: [null],
      parentMobile: ['', [AppValidators.egyptianPhoneNumber]],
    },
    {
      validators: [
        AppValidators.passwordMatchValidator,
        AppValidators.phoneNumbersNotEqualValidator,
      ],
    },
  );

  /** Stable reference to the form controls, used by the template. */
  protected readonly f = this.form.controls;

  /** Template helper: reads the API validation message set on a control. */
  protected readonly serverErrorOf = serverErrorOf;

  protected readonly submitted = signal(false);
  protected readonly loading = signal(false);
  protected readonly showSuccess = signal(false);
  protected readonly showErrorToast = signal(false);
  protected readonly errorToastMessage = signal<string>('');
  protected readonly showPassword = signal(false);
  protected readonly showConfirmPassword = signal(false);
  protected readonly passwordStrength = signal<'weak' | 'medium' | 'strong' | null>(null);
  private toastTimeout: ReturnType<typeof setTimeout> | null = null;

  /** Static role options — plain array, never changes. */
  protected readonly roleOptions = [
    { value: AppRole.ADMIN, label: 'مدير (Admin)', color: '#8b5cf6' },
    { value: AppRole.TEACHER, label: 'معلم (Teacher)', color: '#3b82f6' },
    { value: AppRole.STUDENT, label: 'طالب (Student)', color: '#4ecb8d' },
    { value: AppRole.ASSISTANT, label: 'مساعد (Assistant)', color: '#f59e0b' },
  ];

  // ── Role-derived state ───────────────────────────────────────────────────
  protected readonly role = toSignal(this.form.get('role')!.valueChanges, {
    initialValue: this.form.get('role')?.value,
  });

  protected readonly isStudent = computed(() => this.role() === AppRole.STUDENT);
  protected readonly isAssistant = computed(() => this.role() === AppRole.ASSISTANT);
  protected readonly isRoleLocked = computed(() => this.isEditMode());

  protected readonly showGrade = computed(() => this.isStudent());
  protected readonly showTeacherSelect = computed(() => this.isStudent() || this.isAssistant());
  protected readonly showParentMobile = computed(() => this.isStudent());

  protected readonly teacherSelectLabel = computed(() =>
    this.isAssistant() ? 'المعلم المساعد له' : 'المعلم',
  );
  protected readonly teacherSelectPlaceholder = computed(() =>
    this.isAssistant() ? 'اختر المعلم' : 'اختر المعلم الخاص بالطالب',
  );

  protected readonly showPasswordMismatch = computed(() => {
    if (!this.isEditMode()) return !!this.form.errors?.['passwordMismatch'];
    const pw = this.form.get('password')?.value;
    return !!pw && !!this.form.errors?.['passwordMismatch'];
  });

  constructor() {
    // Keep conditional-field validators in sync with the selected role.
    effect(() => {
      this.updateConditionalValidators(this.role());
    });

    // Surface option-loading failures instead of showing empty dropdowns.
    effect(() => {
      const error = this.optionsResource.error();
      if (error) {
        console.error('Failed to load teacher/grade options', error);
        this.showToast('تعذر تحميل قوائم المعلمين والصفوف');
      }
    });
  }

  ngOnInit() {
    // Detect edit mode from route: /dashboard/users/edit/:id
    this.editUserId.set(this.route.snapshot.paramMap.get('id'));
    this.isEditMode.set(!!this.editUserId());

    if (this.isEditMode() && this.editUserId()) {
      this.switchToEditValidators();
      this.loadUserForEdit(this.editUserId() ?? '');
    }
  }

  /** In edit mode password is optional. */
  private switchToEditValidators() {
    const pw = this.form.get('password');
    const cpw = this.form.get('confirmPassword');

    pw?.clearValidators();
    pw?.addValidators(AppValidators.optionalPasswordValidator);
    pw?.updateValueAndValidity();

    cpw?.clearValidators();
    cpw?.updateValueAndValidity();
  }

  /** Update validators based on the currently selected role. */
  private updateConditionalValidators(role: AppRole | string | null | undefined) {
    const gradeCtrl = this.form.get('gradeId');
    const teacherCtrl = this.form.get('teacherId');
    const parentCtrl = this.form.get('parentMobile');

    // Reset all conditional fields first
    gradeCtrl?.clearValidators();
    teacherCtrl?.clearValidators();
    parentCtrl?.clearValidators();

    if (role === AppRole.STUDENT) {
      gradeCtrl?.addValidators(Validators.required);
      teacherCtrl?.addValidators(Validators.required);
      parentCtrl?.addValidators([Validators.required, AppValidators.egyptianPhoneNumber]);
    } else if (role === AppRole.ASSISTANT) {
      teacherCtrl?.addValidators(Validators.required);
    }

    gradeCtrl?.updateValueAndValidity();
    teacherCtrl?.updateValueAndValidity();
    parentCtrl?.updateValueAndValidity();
  }

  private loadUserForEdit(id: string) {
    this.loadingUser.set(true);

    this.userService
      .getUserById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          this.form.patchValue({
            firstName: user.firstName,
            secondName: user.secondName ?? '',
            thirdName: user.thirdName ?? '',
            lastName: user.lastName,
            mobile: user.mobile ?? '',
            email: user.email ?? '',
            role: user.role,
            gradeId: user.gradeId ?? null,
            teacherId: user.teacherId ?? null,
            parentMobile: user.parentMobile ?? '',
          });
          // Role can't change on an existing user (it's a TPH subtype on the
          // backend, not a column) — lock it after prefill.
          this.form.get('role')?.disable();
          this.loadingUser.set(false);
        },
        error: (err) => {
          console.error('Failed to load user for edit', err);
          this.loadingUser.set(false);
          this.showToast('تعذر تحميل بيانات المستخدم');
        },
      });
  }

  // ── Event handlers ─────────────────────────────────────────────────────────
  onPhoneInput(event: Event, controlName: string) {
    const input = event.target as HTMLInputElement;
    const numeric = input.value.replace(/[^0-9]/g, '');
    this.form.get(controlName)?.setValue(numeric, { emitEvent: false });
    if (controlName === 'mobile' && this.form.get('parentMobile')?.touched)
      this.form.get('parentMobile')?.updateValueAndValidity();
    if (controlName === 'parentMobile' && this.form.get('mobile')?.touched)
      this.form.get('mobile')?.updateValueAndValidity();
  }

  onEmailInput() {
    this.form.get('email')?.updateValueAndValidity();
  }

  onPasswordInput() {
    const pw = this.form.get('password')?.value || '';
    this.passwordStrength.set(pw ? this.getPasswordStrength(pw) : null);
    if (this.isEditMode()) this.form.get('confirmPassword')?.updateValueAndValidity();
  }

  getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*()\-_+=[\]{};'":"\\|,.<>/?]/.test(password)) score++;
    if (score <= 2) return 'weak';
    if (score <= 3) return 'medium';
    return 'strong';
  }

  onRoleChange() {
    // Reset conditional fields when role changes
    this.form.get('gradeId')?.setValue(null);
    this.form.get('teacherId')?.setValue(null);
    this.form.get('parentMobile')?.setValue('');
    this.submitted.set(false);
  }

  onSubmit() {
    this.submitted.set(true);
    this.showErrorToast.set(false);
    if (this.form.invalid) {
      this.showToast('يرجى تصحيح الأخطاء في النموذج');
      return;
    }
    this.loading.set(true);
    if (this.isEditMode()) {
      this.submitUpdate();
    } else {
      this.submitCreate();
    }
  }

  private submitCreate() {
    const data = this.buildCreatePayload();
    this.userService
      .createUser(data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.showSuccess.set(true);
        },
        error: (err) => {
          console.error('Failed to create user', err);
          this.loading.set(false);
          this.showToast(this.validationFallback(err) ?? 'تعذر إضافة المستخدم، حاول مرة أخرى');
        },
      });
  }

  private submitUpdate() {
    const data = this.buildUpdatePayload();
    this.userService
      .updateUser(this.editUserId()!, data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.showSuccess.set(true);
        },
        error: (err) => {
          console.error('Failed to update user', err);
          this.loading.set(false);
          this.showToast(this.validationFallback(err) ?? 'تعذر حفظ التعديلات، حاول مرة أخرى');
        },
      });
  }

  /**
   * Maps ASP.NET ProblemDetails field errors onto the form controls so they render
   * inline under each field, and returns a fallback message ONLY for the errors
   * that had no matching control (or null when there's nothing extra to surface).
   */
  private validationFallback(err: unknown): string | null {
    const problem = (err as { error?: IProblemDetails })?.error;
    const unmapped = applyServerErrors(this.form, problem);
    if (!unmapped.length) return null;
    return problem?.detail ?? problem?.title ?? null;
  }

  private buildCreatePayload(): CreateUserPayload {
    // role control is only ever enabled in create mode, so .value is safe here
    const role = this.form.get('role')?.value;
    const payload: CreateUserPayload = {
      firstName: this.form.get('firstName')?.value,
      secondName: this.form.get('secondName')?.value,
      thirdName: this.form.get('thirdName')?.value,
      lastName: this.form.get('lastName')?.value,
      mobile: this.form.get('mobile')?.value,
      email: this.form.get('email')?.value,
      password: this.form.get('password')?.value,
      role,
    };

    if (role === AppRole.STUDENT) {
      payload.gradeId = this.form.get('gradeId')?.value;
      payload.teacherId = this.form.get('teacherId')?.value;
      payload.parentMobile = this.form.get('parentMobile')?.value || '';
    } else if (role === AppRole.ASSISTANT) {
      // teacherId is accepted here but the backend currently ignores it for
      // Assistant — no Assistant→Teacher FK exists in the DB yet.
      payload.teacherId = this.form.get('teacherId')?.value;
    }

    return payload;
  }

  private buildUpdatePayload(): UpdateUserPayload {
    // role is not part of UpdateUserCommand — it can't change on an existing user
    const payload: UpdateUserPayload = {
      firstName: this.form.get('firstName')?.value,
      secondName: this.form.get('secondName')?.value,
      thirdName: this.form.get('thirdName')?.value,
      lastName: this.form.get('lastName')?.value,
      mobile: this.form.get('mobile')?.value,
      email: this.form.get('email')?.value,
      newPassword: this.form.get('password')?.value || null,
    };

    if (this.isStudent()) {
      payload.gradeId = this.form.get('gradeId')?.value;
      payload.teacherId = this.form.get('teacherId')?.value;
      payload.parentMobile = this.form.get('parentMobile')?.value || '';
    } else if (this.isAssistant()) {
      payload.teacherId = this.form.get('teacherId')?.value;
    }

    return payload;
  }

  addAnother() {
    this.form.reset();
    this.submitted.set(false);
    this.showSuccess.set(false);
    this.passwordStrength.set(null);
    this.router.navigate(['/dashboard/users/add']);
  }

  backToList() {
    this.router.navigate(['/dashboard/users']);
  }

  private showToast(msg: string) {
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.errorToastMessage.set(msg);
    this.showErrorToast.set(true);

    this.toastTimeout = setTimeout(() => {
      this.showErrorToast.set(false);
    }, 7000);
  }

  dismissToast() {
    this.showErrorToast.set(false);
  }

  getPasswordError(): string {
    const errors = this.form.get('password')?.errors;
    if (!errors) return '';
    if (errors['required']) return 'كلمة المرور مطلوبة';
    if (errors['minlength']) return 'كلمة المرور لازم تكون 8 حروف على الأقل';
    if (errors['maxlength']) return 'كلمة المرور لا يمكن أن تتجاوز 128 حرفاً';
    if (errors['hasSpaces']) return 'كلمة المرور لا يجب أن تحتوي على مسافات';
    if (errors['missingUppercase']) return 'كلمة المرور لازم تحتوي على حرف كبير واحد على الأقل';
    if (errors['missingLowercase']) return 'كلمة المرور لازم تحتوي على حرف صغير واحد على الأقل';
    if (errors['missingDigit']) return 'كلمة المرور لازم تحتوي على رقم واحد على الأقل';
    if (errors['missingSpecial']) return 'كلمة المرور لازم تحتوي على رمز خاص (مثل: @، #، !)';
    return '';
  }

  getFullNameError(): string {
    const names = ['firstName', 'secondName', 'thirdName', 'lastName'];
    for (const n of names) {
      const ctrl = this.form.get(n);
      if (ctrl?.errors?.['invalidName']) return 'الاسم يجب أن يحتوي على حروف فقط';
      if (ctrl?.errors?.['maxlength']) return 'كل جزء من الاسم لا يتجاوز 20 حرفاً';
    }
    for (const n of names) {
      if (this.form.get(n)?.errors?.['required'] || this.form.get(n)?.errors?.['minlength'])
        return 'جميع أجزاء الاسم مطلوبة (حرفين على الأقل لكل جزء)';
    }
    return '';
  }
}
