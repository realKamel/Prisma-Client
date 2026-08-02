import { Component, OnInit, computed, inject, signal } from '@angular/core';
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
import { toSignal } from '@angular/core/rxjs-interop';

// ── Component ──────────────────────────────────────────────────────────────
@Component({
  selector: 'app-user-form',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './user-form.html',
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);

  // ── Mode ───────────────────────────────────────────
  // isEditMode = false;
  protected readonly isEditMode = signal(false);
  // editUserId: string | null = null;
  protected readonly editUserId = signal<string | null>(null);
  // loadingUser = false;
  protected readonly loadingUser = signal(false);
  // loadingOptions = true;
  protected loadingOptions = signal(true);

  // ── Form state ─────────────────────────────────────
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
      // Conditional fields
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

  protected readonly fromValue = toSignal(this.form.valueChanges, {
    initialValue: this.form.value,
  });

  protected readonly submitted = signal(false);
  protected readonly loading = signal(false);
  protected readonly showSuccess = signal(false);
  protected readonly showErrorToast = signal(false);
  protected readonly errorToastMessage = signal<string>('');
  private toastTimeout: ReturnType<typeof setTimeout> | null = null;

  protected readonly showPassword = signal(false);
  showConfirmPassword = signal(false);
  passwordStrength = signal<'weak' | 'medium' | 'strong' | null>(null);

  // ── Options ────────────────────────────────────────
  protected readonly roleOptions = signal([
    { value: 'Admin', label: 'مدير (Admin)', color: '#8b5cf6' },
    { value: 'Teacher', label: 'معلم (Teacher)', color: '#3b82f6' },
    { value: 'Student', label: 'طالب (Student)', color: '#4ecb8d' },
    { value: 'Assistant', label: 'مساعد (Assistant)', color: '#f59e0b' },
  ]);

  // Fetched from the backend on init — see loadOptions()
  // teacherOptions: TeacherOption[] = [];
  protected readonly teacherOptions = signal<TeacherOption[]>([]);
  // gradeOptions: GradeOption[] = [];
  protected readonly gradeOptions = signal<GradeOption[]>([]);

  ngOnInit() {
    this.loadOptions();

    // Detect edit mode from route: /dashboard/users/edit/:id
    this.editUserId.set(this.route.snapshot.paramMap.get('id'));
    this.isEditMode.set(!!this.editUserId);

    if (this.isEditMode() && this.editUserId()) {
      this.switchToEditValidators();
      this.loadUserForEdit(this.editUserId() ?? '');
    }

    // Listen to role changes to update conditional validators
    this.form.get('role')?.valueChanges.subscribe(() => {
      this.updateConditionalValidators();
    });
  }

  /** Populates teacherOptions / gradeOptions dropdowns from the backend. */
  private loadOptions() {
    this.loadingOptions.set(true);
    forkJoin({
      teachers: this.userService.getTeacherOptions(),
      grades: this.userService.getGradeOptions(),
    }).subscribe({
      next: ({ teachers, grades }) => {
        this.teacherOptions.set(teachers);
        this.gradeOptions.set(grades);
        this.loadingOptions.set(false);
      },
      error: (err) => {
        console.error('Failed to load teacher/grade options', err);
        this.loadingOptions.set(false);
        this.showToast('تعذر تحميل قوائم المعلمين والصفوف');
      },
    });
  }

  /** In edit mode password is optional */
  private switchToEditValidators() {
    const pw = this.form.get('password');
    const cpw = this.form.get('confirmPassword');

    pw?.clearValidators();
    pw?.addValidators(AppValidators.optionalPasswordValidator);
    pw?.updateValueAndValidity();

    cpw?.clearValidators();
    cpw?.updateValueAndValidity();
  }

  /** Update validators based on selected role */
  private updateConditionalValidators() {
    const role = this.form.get('role')?.value;
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
    } else if (role === 'Assistant') {
      teacherCtrl?.addValidators(Validators.required);
    }

    gradeCtrl?.updateValueAndValidity();
    teacherCtrl?.updateValueAndValidity();
    parentCtrl?.updateValueAndValidity();
  }

  private loadUserForEdit(id: string) {
    this.loadingUser.set(true);

    // this.cdr.detectChanges();

    this.userService.getUserById(id).subscribe({
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
        // role was set programmatically — refresh conditional validators
        this.updateConditionalValidators();
        this.loadingUser.set(false);
        // this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load user for edit', err);
        this.loadingUser.set(false);
        this.showToast('تعذر تحميل بيانات المستخدم');
        // this.cdr.detectChanges();
      },
    });
  }

  get f() {
    return this.form.controls;
  }

  // ── Computed visibility helpers ───────────────────────────────────────────
  get showGrade(): boolean {
    return this.form.get('role')?.value === 'Student';
  }

  get showTeacherSelect(): boolean {
    const role = this.form.get('role')?.value;
    return role === 'Student' || role === 'Assistant';
  }

  get showParentMobile(): boolean {
    return this.form.get('role')?.value === 'Student';
  }

  get isStudent(): boolean {
    return this.form.get('role')?.value === 'Student';
  }

  get isAssistant(): boolean {
    return this.form.get('role')?.value === 'Assistant';
  }

  get isRoleLocked(): boolean {
    return this.isEditMode();
  }

  get teacherSelectLabel(): string {
    return this.isAssistant ? 'المعلم المساعد له' : 'المعلم';
  }

  get teacherSelectPlaceholder(): string {
    return this.isAssistant ? 'اختر المعلم' : 'اختر المعلم الخاص بالطالب';
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
    if (/[!@#$%^&*()\-_+=\[\]{};'":"\\|,.<>/?]/.test(password)) score++;
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
    // this.cdr.detectChanges();
    this.isEditMode() ? this.submitUpdate() : this.submitCreate();
  }

  private submitCreate() {
    const data = this.buildCreatePayload();
    this.userService.createUser(data).subscribe({
      next: () => {
        this.loading.set(false);
        this.showSuccess.set(true);
      },
      error: (err) => {
        console.error('Failed to create user', err);
        this.loading.set(false);
        this.showToast(this.extractErrorMessage(err) ?? 'تعذر إضافة المستخدم، حاول مرة أخرى');
        // this.cdr.detectChanges();
      },
    });
  }

  private submitUpdate() {
    const data = this.buildUpdatePayload();
    this.userService.updateUser(this.editUserId()!, data).subscribe({
      next: () => {
        this.loading.set(false);
        this.showSuccess.set(true);
      },
      error: (err) => {
        console.error('Failed to update user', err);
        this.loading.set(false);
        this.showToast(this.extractErrorMessage(err) ?? 'تعذر حفظ التعديلات، حاول مرة أخرى');
      },
    });
  }

  /** Backend can return { message: '...' } (e.g. "email already exists")
   *  and it'll surface directly in the toast instead of a generic string. */
  private extractErrorMessage(err: any): string | null {
    const problem = err?.error as IProblemDetails | undefined;
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
    } else if (role === 'Assistant') {
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

    if (this.isStudent) {
      payload.gradeId = this.form.get('gradeId')?.value;
      payload.teacherId = this.form.get('teacherId')?.value;
      payload.parentMobile = this.form.get('parentMobile')?.value || '';
    } else if (this.isAssistant) {
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

  protected readonly showPasswordMismatch = computed(() => {
    if (!this.isEditMode()) return !!this.form.errors?.['passwordMismatch'];
    const pw = this.form.get('password')?.value;
    return !!pw && !!this.form.errors?.['passwordMismatch'];
  });

  roleStyle(role: string) {
    const map: Record<string, { bg: string; text: string; dot: string; label: string }> = {
      Admin: { bg: 'rgba(139,92,246,0.16)', text: '#8b5cf6', dot: '#8b5cf6', label: 'مدير' },
      Teacher: { bg: 'rgba(59,130,246,0.16)', text: '#3b82f6', dot: '#3b82f6', label: 'معلم' },
      Student: { bg: 'rgba(78,203,141,0.16)', text: '#4ecb8d', dot: '#4ecb8d', label: 'طالب' },
      Assistant: { bg: 'rgba(245,158,11,0.16)', text: '#f59e0b', dot: '#f59e0b', label: 'مساعد' },
    };
    return (
      map[role] || { bg: 'var(--surface2)', text: 'var(--muted)', dot: 'var(--muted)', label: role }
    );
  }
}
