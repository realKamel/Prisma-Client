import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import {
  FormBuilder, FormGroup, Validators, ReactiveFormsModule,
  AbstractControl, ValidationErrors
} from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TeacherStudentsService } from '../../../../core/Services/teacher-students.service';
import { AcademicYear, ACADEMIC_YEARS } from '../../../../core/Models/Teacher/student.model';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './student-form.html',
})
export class StudentForm implements OnInit {
  private fb      = inject(FormBuilder);
  private router  = inject(Router);
  private route   = inject(ActivatedRoute);
  private cdr     = inject(ChangeDetectorRef);
  private service = inject(TeacherStudentsService);

  // ── Mode ───────────────────────────────────────────
  isEditMode = false;
  editStudentId: string | null = null;
  loadingStudent = false;

  // ── Form state ─────────────────────────────────────
  form: FormGroup;
  submitted = false;
  loading = false;
  showSuccess = false;
  showErrorToast = false;
  errorToastMessage = '';
  private toastTimeout: ReturnType<typeof setTimeout> | null = null;

  showPassword = false;
  showConfirmPassword = false;
  passwordStrength: 'weak' | 'medium' | 'strong' | null = null;

  gradeOptions: AcademicYear[] = [];

  private readonly PHONE_RE = /^(010|011|012|015)\d{8}$/;

  constructor() {
    this.form = this.fb.group({
      firstName:       ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20), nameValidator]],
      secondName:      ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20), nameValidator]],
      thirdName:       ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20), nameValidator]],
      lastName:        ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20), nameValidator]],
      mobile:          ['', [Validators.required, Validators.pattern(this.PHONE_RE)]],
      email:           ['', [Validators.required, Validators.maxLength(254), gmailValidator]],
      password:        ['', [Validators.required, passwordValidator]],
      confirmPassword: ['', [Validators.required]],
      grade:           [null, Validators.required],
      parentMobile:    ['', [Validators.required, Validators.pattern(this.PHONE_RE)]],
    }, {
      validators: [passwordMatchValidator, phoneNumbersNotEqualValidator]
    });
  }

  ngOnInit() {
    // Load grade options from backend
    this.service.getAcademicYears().subscribe({
      next: years => {
        this.gradeOptions = years;
        this.cdr.detectChanges();
      },
      error: () => {
        this.gradeOptions = ACADEMIC_YEARS;
        this.cdr.detectChanges();
      }
    });

    // Detect edit mode from route: /dashboard/mystudents/edit/:id
    this.editStudentId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.editStudentId;

    if (this.isEditMode && this.editStudentId) {
      this.loadStudentForEdit(this.editStudentId);
    }
  }

  private loadStudentForEdit(id: string) {
    this.loadingStudent = true;
    this.cdr.detectChanges();

    // In edit mode: email and password are not editable — relax their validators
    this.form.get('email')?.clearValidators();
    this.form.get('email')?.updateValueAndValidity();
    this.form.get('password')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();
    this.form.get('confirmPassword')?.clearValidators();
    this.form.get('confirmPassword')?.updateValueAndValidity();

    this.service.getStudentForEdit(id).subscribe({
      next: data => {
        this.form.patchValue({
          firstName:    data.firstName,
          secondName:   data.secondName,
          thirdName:    data.thirdName,
          lastName:     data.lastName,
          mobile:       data.mobile,
          grade:        data.grade,
          parentMobile: data.parentMobile,
        });
        this.loadingStudent = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingStudent = false;
        this.showToast('تعذّر تحميل بيانات الطالب');
        this.cdr.detectChanges();
      }
    });
  }

  get f() { return this.form.controls; }

  onPhoneInput(event: Event, controlName: string) {
    const input = event.target as HTMLInputElement;
    const numeric = input.value.replace(/[^0-9]/g, '');
    this.form.get(controlName)?.setValue(numeric, { emitEvent: false });
    if (controlName === 'mobile' && this.form.get('parentMobile')?.touched) {
      this.form.get('parentMobile')?.updateValueAndValidity();
    }
    if (controlName === 'parentMobile' && this.form.get('mobile')?.touched) {
      this.form.get('mobile')?.updateValueAndValidity();
    }
  }

  onEmailInput() { this.form.get('email')?.updateValueAndValidity(); }

  onPasswordInput() {
    const pw = this.form.get('password')?.value || '';
    this.passwordStrength = pw ? this.getPasswordStrength(pw) : null;
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

  onSubmit() {
    this.submitted = true;
    this.showErrorToast = false;

    if (this.form.invalid) {
      this.showToast('يرجى تصحيح الأخطاء في النموذج');
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    if (this.isEditMode && this.editStudentId) {
      this.submitUpdate();
    } else {
      this.submitCreate();
    }
  }

  private submitCreate() {
    const data = {
      firstName:    this.form.get('firstName')?.value,
      secondName:   this.form.get('secondName')?.value,
      thirdName:    this.form.get('thirdName')?.value,
      lastName:     this.form.get('lastName')?.value,
      mobile:       this.form.get('mobile')?.value,
      email:        this.form.get('email')?.value,
      password:     this.form.get('password')?.value,
      grade:        this.form.get('grade')?.value,
      parentMobile: this.form.get('parentMobile')?.value || '',
    };

    this.service.addStudent(data).subscribe({
      next: () => {
        this.loading = false;
        this.showSuccess = true;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.showToast('حدث خطأ أثناء الحفظ، يرجى المحاولة مرة أخرى');
        this.cdr.detectChanges();
      }
    });
  }

  private submitUpdate() {
    const data = {
      firstName:    this.form.get('firstName')?.value,
      secondName:   this.form.get('secondName')?.value,
      thirdName:    this.form.get('thirdName')?.value,
      lastName:     this.form.get('lastName')?.value,
      mobile:       this.form.get('mobile')?.value,
      grade:        this.form.get('grade')?.value,
      parentMobile: this.form.get('parentMobile')?.value || '',
    };

    this.service.updateStudent(this.editStudentId!, data).subscribe({
      next: () => {
        this.loading = false;
        this.showSuccess = true;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.showToast('حدث خطأ أثناء التعديل، يرجى المحاولة مرة أخرى');
        this.cdr.detectChanges();
      }
    });
  }

  addAnother() {
    this.form.reset();
    this.submitted = false;
    this.showSuccess = false;
    this.passwordStrength = null;
    this.cdr.detectChanges();
    this.router.navigate(['/dashboard/mystudents/add']);
  }

  backToList() {
    this.router.navigate(['/dashboard/mystudents']);
  }

  private showToast(msg: string) {
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.errorToastMessage = msg;
    this.showErrorToast = true;
    this.cdr.detectChanges();
    this.toastTimeout = setTimeout(() => {
      this.showErrorToast = false;
      this.cdr.detectChanges();
    }, 7000);
  }

  dismissToast() { this.showErrorToast = false; }

  getPasswordError(): string {
    const errors = this.form.get('password')?.errors;
    if (!errors) return '';
    if (errors['required'])         return 'كلمة المرور مطلوبة';
    if (errors['minlength'])        return 'كلمة المرور لازم تكون 8 حروف على الأقل';
    if (errors['maxlength'])        return 'كلمة المرور لا يمكن أن تتجاوز 128 حرفاً';
    if (errors['hasSpaces'])        return 'كلمة المرور لا يجب أن تحتوي على مسافات';
    if (errors['missingUppercase']) return 'كلمة المرور لازم تحتوي على حرف كبير واحد على الأقل';
    if (errors['missingLowercase']) return 'كلمة المرور لازم تحتوي على حرف صغير واحد على الأقل';
    if (errors['missingDigit'])     return 'كلمة المرور لازم تحتوي على رقم واحد على الأقل';
    if (errors['missingSpecial'])   return 'كلمة المرور لازم تحتوي على رمز خاص (مثل: @، #، !)';
    return '';
  }

  getFullNameError(): string {
    const names = ['firstName', 'secondName', 'thirdName', 'lastName'];
    for (const n of names) {
      const ctrl = this.form.get(n);
      if (ctrl?.errors?.['invalidName']) return 'الاسم يجب أن يحتوي على حروف فقط';
      if (ctrl?.errors?.['maxlength'])   return 'كل جزء من الاسم لا يتجاوز 20 حرفاً';
    }
    for (const n of names) {
      if (this.form.get(n)?.errors?.['required'] || this.form.get(n)?.errors?.['minlength']) {
        return 'جميع أجزاء الاسم مطلوبة (حرفين على الأقل لكل جزء)';
      }
    }
    return '';
  }
}

// ── Validators ──────────────────────────────────────────────────────────────

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
  if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) return { invalidGmail: true };
  return null;
}

function passwordValidator(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value;
  if (!value) return null;
  const errors: ValidationErrors = {};
  if (value.length < 8)    errors['minlength'] = true;
  if (value.length > 128)  errors['maxlength'] = true;
  if (!/[A-Z]/.test(value)) errors['missingUppercase'] = true;
  if (!/[a-z]/.test(value)) errors['missingLowercase'] = true;
  if (!/\d/.test(value))    errors['missingDigit'] = true;
  if (!/[!@#$%^&*()\-_+=\[\]{};\'":"\\|,.<>/?]/.test(value)) errors['missingSpecial'] = true;
  if (value.includes(' ')) errors['hasSpaces'] = true;
  return Object.keys(errors).length ? errors : null;
}

function passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
  const pw = form.get('password')?.value;
  const cp = form.get('confirmPassword')?.value;
  return pw && cp && pw !== cp ? { passwordMismatch: true } : null;
}

function phoneNumbersNotEqualValidator(form: AbstractControl): ValidationErrors | null {
  const m = form.get('mobile')?.value;
  const p = form.get('parentMobile')?.value;
  return m && p && m === p ? { samePhoneNumbers: true } : null;
}