import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import {
  FormBuilder, FormGroup, Validators, ReactiveFormsModule,
  AbstractControl, ValidationErrors
} from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

// ── Models ───────────────────────────────────────────────────────────────────
export interface User {
  id: number;
  firstName: string;
  secondName: string;
  thirdName: string;
  lastName: string;
  mobile: string;
  email: string;
  password: string;
  role: 'Admin' | 'Teacher' | 'Student' | 'Assistant';
  gradeId?: number | null;
  teacherId?: number | null;
  parentMobile?: string;
}

export interface TeacherOption {
  id: number;
  name: string;
}

export interface GradeOption {
  id: number;
  name: string;
}

// ── Component ──────────────────────────────────────────────────────────────
@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './user-form.html',
})
export class UserFormComponent implements OnInit {
  private fb      = inject(FormBuilder);
  private router  = inject(Router);
  private route   = inject(ActivatedRoute);
  private cdr     = inject(ChangeDetectorRef);

  // ── Mode ───────────────────────────────────────────
  isEditMode = false;
  editUserId: string | null = null;
  loadingUser = false;

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

  // ── Options ────────────────────────────────────────
  roleOptions = [
    { value: 'Admin',     label: 'مدير (Admin)',     color: '#8b5cf6' },
    { value: 'Teacher',   label: 'معلم (Teacher)',   color: '#3b82f6' },
    { value: 'Student',   label: 'طالب (Student)',   color: '#4ecb8d' },
    { value: 'Assistant', label: 'مساعد (Assistant)', color: '#f59e0b' },
  ];

  // Dummy teachers list — replace with real API call
  teacherOptions: TeacherOption[] = [
    { id: 1, name: 'أحمد محمد علي' },
    { id: 2, name: 'سارة خالد عبدالله' },
    { id: 3, name: 'خالد عبدالله فؤاد' },
    { id: 4, name: 'ليلى محمود كمال' },
    { id: 5, name: 'منى إبراهيم علي' },
  ];

  // Dummy grades — replace with real API call
  gradeOptions: GradeOption[] = [
    { id: 1, name: 'الصف الأول الثانوي' },
    { id: 2, name: 'الصف الثاني الثانوي' },
    { id: 3, name: 'الصف الثالث الثانوي' },
  ];

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
      role:            ['', Validators.required],
      // Conditional fields
      gradeId:         [null],
      teacherId:       [null],
      parentMobile:    ['', [Validators.pattern(this.PHONE_RE)]],
    }, {
      validators: [passwordMatchValidator, phoneNumbersNotEqualValidator]
    });
  }

  ngOnInit() {
    // Detect edit mode from route: /dashboard/users/edit/:id
    this.editUserId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.editUserId;

    if (this.isEditMode && this.editUserId) {
      this.switchToEditValidators();
      this.loadUserForEdit(this.editUserId);
    }

    // Listen to role changes to update conditional validators
    this.form.get('role')?.valueChanges.subscribe(() => {
      this.updateConditionalValidators();
    });
  }

  /** In edit mode password is optional */
  private switchToEditValidators() {
    const pw  = this.form.get('password');
    const cpw = this.form.get('confirmPassword');

    pw?.clearValidators();
    pw?.addValidators(optionalPasswordValidator);
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

    if (role === 'Student') {
      gradeCtrl?.addValidators(Validators.required);
      teacherCtrl?.addValidators(Validators.required);
      parentCtrl?.addValidators([Validators.required, Validators.pattern(this.PHONE_RE)]);
    } else if (role === 'Assistant') {
      teacherCtrl?.addValidators(Validators.required);
    }

    gradeCtrl?.updateValueAndValidity();
    teacherCtrl?.updateValueAndValidity();
    parentCtrl?.updateValueAndValidity();
  }

  private loadUserForEdit(id: string) {
    this.loadingUser = true;
    this.cdr.detectChanges();

    // TODO: Replace with real API call
    // this.service.getUserForEdit(id).subscribe({...})

    // Simulate loading for demo
    setTimeout(() => {
      this.loadingUser = false;
      this.cdr.detectChanges();
    }, 800);
  }

  get f() { return this.form.controls; }

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

  onEmailInput() { this.form.get('email')?.updateValueAndValidity(); }

  onPasswordInput() {
    const pw = this.form.get('password')?.value || '';
    this.passwordStrength = pw ? this.getPasswordStrength(pw) : null;
    if (this.isEditMode) this.form.get('confirmPassword')?.updateValueAndValidity();
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
    this.submitted = false;
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
    this.isEditMode ? this.submitUpdate() : this.submitCreate();
  }

  private submitCreate() {
    const data = this.buildPayload();
    console.log('Creating user:', data);
    // TODO: this.service.addUser(data).subscribe({...})
    setTimeout(() => {
      this.loading = false;
      this.showSuccess = true;
      this.cdr.detectChanges();
    }, 1000);
  }

  private submitUpdate() {
    const data = this.buildPayload();
    console.log('Updating user:', data);
    // TODO: this.service.updateUser(this.editUserId!, data).subscribe({...})
    setTimeout(() => {
      this.loading = false;
      this.showSuccess = true;
      this.cdr.detectChanges();
    }, 1000);
  }

  private buildPayload() {
    const role = this.form.get('role')?.value;
    const payload: any = {
      firstName:    this.form.get('firstName')?.value,
      secondName:   this.form.get('secondName')?.value,
      thirdName:    this.form.get('thirdName')?.value,
      lastName:     this.form.get('lastName')?.value,
      mobile:       this.form.get('mobile')?.value,
      email:        this.form.get('email')?.value,
      password:     this.form.get('password')?.value || undefined,
      role:         role,
    };

    if (role === 'Student') {
      payload.gradeId = this.form.get('gradeId')?.value;
      payload.teacherId = this.form.get('teacherId')?.value;
      payload.parentMobile = this.form.get('parentMobile')?.value || '';
    } else if (role === 'Assistant') {
      payload.teacherId = this.form.get('teacherId')?.value;
    }

    return payload;
  }

  addAnother() {
    this.form.reset();
    this.submitted = false;
    this.showSuccess = false;
    this.passwordStrength = null;
    this.cdr.detectChanges();
    this.router.navigate(['/dashboard/users/add']);
  }

  backToList() { this.router.navigate(['/dashboard/users']); }

  private showToast(msg: string) {
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.errorToastMessage = msg;
    this.showErrorToast = true;
    this.cdr.detectChanges();
    this.toastTimeout = setTimeout(() => { this.showErrorToast = false; this.cdr.detectChanges(); }, 7000);
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
      if (this.form.get(n)?.errors?.['required'] || this.form.get(n)?.errors?.['minlength'])
        return 'جميع أجزاء الاسم مطلوبة (حرفين على الأقل لكل جزء)';
    }
    return '';
  }

  get showPasswordMismatch(): boolean {
    if (!this.isEditMode) return !!this.form.errors?.['passwordMismatch'];
    const pw = this.form.get('password')?.value;
    return !!pw && !!this.form.errors?.['passwordMismatch'];
  }

  roleStyle(role: string) {
    const map: Record<string, { bg: string; text: string; dot: string; label: string }> = {
      Admin:     { bg: 'rgba(139,92,246,0.16)', text: '#8b5cf6', dot: '#8b5cf6', label: 'مدير' },
      Teacher:   { bg: 'rgba(59,130,246,0.16)', text: '#3b82f6', dot: '#3b82f6', label: 'معلم' },
      Student:   { bg: 'rgba(78,203,141,0.16)',  text: '#4ecb8d', dot: '#4ecb8d', label: 'طالب' },
      Assistant: { bg: 'rgba(245,158,11,0.16)', text: '#f59e0b', dot: '#f59e0b', label: 'مساعد' },
    };
    return map[role] || { bg: 'var(--surface2)', text: 'var(--muted)', dot: 'var(--muted)', label: role };
  }
}

// ── Validators ──────────────────────────────────────────────────────────────

function nameValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;
  return /^[\u0600-\u06FFa-zA-Z\s'\-.]+$/.test(value) ? null : { invalidName: true };
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
  if (!/[!@#$%^&*()\-_+=\[\]{};'":"\\|,.<>/?]/.test(value)) errors['missingSpecial'] = true;
  if (value.includes(' ')) errors['hasSpaces'] = true;
  return Object.keys(errors).length ? errors : null;
}

function optionalPasswordValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value?.trim()) return null;
  return passwordValidator(control);
}

function passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
  const pw  = form.get('password')?.value;
  const cpw = form.get('confirmPassword')?.value;
  if (!pw && !cpw) return null;
  return pw && cpw && pw !== cpw ? { passwordMismatch: true } : null;
}

function phoneNumbersNotEqualValidator(form: AbstractControl): ValidationErrors | null {
  const m = form.get('mobile')?.value;
  const p = form.get('parentMobile')?.value;
  return m && p && m === p ? { samePhoneNumbers: true } : null;
}