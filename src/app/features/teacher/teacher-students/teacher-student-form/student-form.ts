import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TeacherStudentsService } from '../../../../core/Services/teacher-students.service';
import { AcademicYear, ACADEMIC_YEARS } from '../../../../core/Models/Teacher/student.model';
import { IProblemDetails } from '../../../../core/Models/problemDetails';
import { AppValidators } from '../../../../shared/validators/phone-number-validator';
import { applyServerErrors, serverErrorOf } from '../../../../shared/validators/server-errors';

@Component({
  selector: 'app-student-form',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './student-form.html',
})
export class StudentForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly service = inject(TeacherStudentsService);

  // Directly intercepts route parameters (e.g., /edit/:id) via withComponentInputBinding()
  readonly id = input<string | null>(null);

  // Core Reactive Collections
  readonly gradeOptions = signal<AcademicYear[]>([]);

  // View & Feedback Status Signals
  readonly isEditMode = computed(() => !!this.id());
  readonly loadingStudent = signal(false);
  readonly submitted = signal(false);
  readonly loading = signal(false);
  readonly showSuccess = signal(false);

  // Toast Notification Signals
  readonly showErrorToast = signal(false);
  readonly errorToastMessage = signal('');

  // Password Utility Signals
  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);
  readonly passwordStrength = signal<'weak' | 'medium' | 'strong' | null>(null);

  readonly form: FormGroup;

  // Computed Selector: Replaces old getter to verify mismatch logic cleanly
  readonly showPasswordMismatch = computed(() => {
    const isEdit = this.isEditMode();
    const isMismatch = !!this.form.errors?.['passwordMismatch'];
    if (!isEdit) return isMismatch;

    const pw = this.form.get('password')?.value;
    return !!pw && isMismatch;
  });

  constructor() {
    this.form = this.fb.group(
      {
        firstName: [
          '',
          [Validators.required, Validators.minLength(2), Validators.maxLength(20), nameValidator],
        ],
        secondName: [
          '',
          [Validators.required, Validators.minLength(2), Validators.maxLength(20), nameValidator],
        ],
        thirdName: [
          '',
          [Validators.required, Validators.minLength(2), Validators.maxLength(20), nameValidator],
        ],
        lastName: [
          '',
          [Validators.required, Validators.minLength(2), Validators.maxLength(20), nameValidator],
        ],
        mobile: ['', [Validators.required, AppValidators.egyptianPhoneNumber]],
        email: ['', [Validators.required, Validators.maxLength(254), AppValidators.gmailValidator]],
        password: ['', [Validators.required, passwordValidator]],
        confirmPassword: ['', [Validators.required]],
        grade: [null, Validators.required],
        parentMobile: ['', [Validators.required, AppValidators.egyptianPhoneNumber]],
      },
      {
        validators: [passwordMatchValidator, phoneNumbersNotEqualValidator],
      },
    );

    // Reactive Effect to handle self-dismissing error toast safely
    effect((onCleanup) => {
      if (this.showErrorToast()) {
        const timer = setTimeout(() => {
          this.showErrorToast.set(false);
        }, 7000);

        onCleanup(() => clearTimeout(timer));
      }
    });

    // Reactive Effect to watch change modes from URL binding input tokens
    effect(() => {
      const studentId = this.id();
      if (studentId) {
        this.switchToEditValidators();
        this.loadStudentForEdit(studentId);
      }
    });
  }

  ngOnInit(): void {
    this.service.getAcademicYears().subscribe({
      next: (years) => this.gradeOptions.set(years),
      error: () => this.gradeOptions.set(ACADEMIC_YEARS),
    });
  }

  private switchToEditValidators(): void {
    const pw = this.form.get('password');
    const cpw = this.form.get('confirmPassword');

    pw?.clearValidators();
    pw?.addValidators(optionalPasswordValidator);
    pw?.updateValueAndValidity();

    cpw?.clearValidators();
    cpw?.updateValueAndValidity();
  }

  private loadStudentForEdit(studentId: string): void {
    this.loadingStudent.set(true);

    this.service.getStudentForEdit(studentId).subscribe({
      next: (data) => {
        this.form.patchValue({
          firstName: data.firstName,
          secondName: data.secondName,
          thirdName: data.thirdName,
          lastName: data.lastName,
          mobile: data.mobile,
          email: data.email,
          grade: data.grade,
          parentMobile: data.parentMobile,
        });
        this.loadingStudent.set(false);
      },
      error: () => {
        this.loadingStudent.set(false);
        this.showToast('تعذّر تحميل بيانات الطالب');
      },
    });
  }

  get f() {
    return this.form.controls;
  }

  /** Template helper: reads the API validation message set on a control. */
  readonly serverErrorOf = serverErrorOf;

  onPhoneInput(event: Event, controlName: string): void {
    const inputElement = event.target as HTMLInputElement;
    const numeric = inputElement.value.replace(/[^0-9]/g, '');
    this.form.get(controlName)?.setValue(numeric, { emitEvent: false });

    if (controlName === 'mobile' && this.form.get('parentMobile')?.touched) {
      this.form.get('parentMobile')?.updateValueAndValidity();
    }
    if (controlName === 'parentMobile' && this.form.get('mobile')?.touched) {
      this.form.get('mobile')?.updateValueAndValidity();
    }
  }

  onEmailInput(): void {
    this.form.get('email')?.updateValueAndValidity();
  }

  onPasswordInput(): void {
    const pw = this.form.get('password')?.value || '';
    this.passwordStrength.set(pw ? this.getPasswordStrength(pw) : null);

    if (this.isEditMode()) {
      this.form.get('confirmPassword')?.updateValueAndValidity();
    }
  }

  getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*()\-_+=\[\]{};\'":"\\|,.<>/?]/.test(password)) score++;

    if (score <= 2) return 'weak';
    if (score <= 3) return 'medium';
    return 'strong';
  }

  onSubmit(): void {
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

  private submitCreate(): void {
    const data = {
      firstName: this.form.get('firstName')?.value,
      secondName: this.form.get('secondName')?.value,
      thirdName: this.form.get('thirdName')?.value,
      lastName: this.form.get('lastName')?.value,
      mobile: this.form.get('mobile')?.value,
      email: this.form.get('email')?.value,
      password: this.form.get('password')?.value,
      grade: this.form.get('grade')?.value,
      parentMobile: this.form.get('parentMobile')?.value || '',
    };

    this.service.addStudent(data).subscribe({
      next: () => {
        this.loading.set(false);
        this.showSuccess.set(true);
      },
      error: (err) => {
        this.loading.set(false);
        this.showToast(
          this.validationFallback(err) ?? 'حدث خطأ أثناء الحفظ، يرجى المحاولة مرة أخرى',
        );
      },
    });
  }

  private submitUpdate(): void {
    const newPassword = this.form.get('password')?.value?.trim() || undefined;
    const data = {
      firstName: this.form.get('firstName')?.value,
      secondName: this.form.get('secondName')?.value,
      thirdName: this.form.get('thirdName')?.value,
      lastName: this.form.get('lastName')?.value,
      mobile: this.form.get('mobile')?.value,
      email: this.form.get('email')?.value,
      newPassword,
      grade: this.form.get('grade')?.value,
      parentMobile: this.form.get('parentMobile')?.value || '',
    };

    this.service.updateStudent(this.id()!, data).subscribe({
      next: () => {
        this.loading.set(false);
        this.showSuccess.set(true);
      },
      error: (err) => {
        this.loading.set(false);
        this.showToast(
          this.validationFallback(err) ?? 'حدث خطأ أثناء التعديل، يرجى المحاولة مرة أخرى',
        );
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

  addAnother(): void {
    this.form.reset();
    this.submitted.set(false);
    this.showSuccess.set(false);
    this.passwordStrength.set(null);
    this.router.navigate(['/dashboard/mystudents/add']);
  }

  backToList(): void {
    this.router.navigate(['/dashboard/mystudents']);
  }

  private showToast(msg: string): void {
    this.errorToastMessage.set(msg);
    this.showErrorToast.set(true);
  }

  dismissToast(): void {
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
      if (this.form.get(n)?.errors?.['required'] || this.form.get(n)?.errors?.['minlength']) {
        return 'جميع أجزاء الاسم مطلوبة (حرفين على الأقل لكل جزء)';
      }
    }
    return '';
  }
}

// ── Custom Pure Validators (Unchanged logic, globally safe) ─────────────────

function nameValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;
  return /^[\u0600-\u06FFa-zA-Z\s\'\-.]+$/.test(value) ? null : { invalidName: true };
}

function gmailValidator(control: AbstractControl): ValidationErrors | null {
  const raw = control.value;
  if (!raw) return null;
  const email = raw.trim().toLowerCase();
  if (!email.endsWith('@gmail.com')) return { invalidGmail: true };
  if (!/^[^\s@]+@gmail\.com$/.test(email)) return { invalidGmail: true };
  const local = email.split('@')[0];
  if (local.startsWith('.') || local.endsWith('.') || local.includes('..'))
    return { invalidGmail: true };
  return null;
}

function passwordValidator(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value;
  if (!value) return null;
  const errors: ValidationErrors = {};
  if (value.length < 8) errors['minlength'] = true;
  if (value.length > 128) errors['maxlength'] = true;
  if (!/[A-Z]/.test(value)) errors['missingUppercase'] = true;
  if (!/[a-z]/.test(value)) errors['missingLowercase'] = true;
  if (!/\d/.test(value)) errors['missingDigit'] = true;
  if (!/[!@#$%^&*()\-_+=\[\]{};\'":"\\|,.<>/?]/.test(value)) errors['missingSpecial'] = true;
  if (value.includes(' ')) errors['hasSpaces'] = true;
  return Object.keys(errors).length ? errors : null;
}

function optionalPasswordValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value?.trim()) return null;
  return passwordValidator(control);
}

function passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
  const pw = form.get('password')?.value;
  const cpw = form.get('confirmPassword')?.value;
  if (!pw && !cpw) return null;
  return pw && cpw && pw !== cpw ? { passwordMismatch: true } : null;
}

// Key fix: handles safe syntax check outside string parsing blocks for XML compilation
function phoneNumbersNotEqualValidator(form: AbstractControl): ValidationErrors | null {
  const m = form.get('mobile')?.value;
  const p = form.get('parentMobile')?.value;
  return m && p && m === p ? { samePhoneNumbers: true } : null;
}
