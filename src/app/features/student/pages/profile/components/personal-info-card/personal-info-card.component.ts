import { ChangeDetectionStrategy, Component, inject, signal, output, input } from '@angular/core';

import { FormsModule } from '@angular/forms';
import {
  GradeOption,
  StudentProfile,
} from '../../../../../../core/Models/Student/student-profile.model';
import { ProfileService } from '../../../../../../core/Services/profile.service';
import { isEgyptianMobile, isValidEmail } from '../../profile-validators';
import { toast } from 'ngx-sonner';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  bootstrapPencilSquare,
  bootstrapPerson,
  bootstrapTelephone,
  bootstrapEnvelope,
  bootstrapMortarboard,
  bootstrapWhatsapp,
  bootstrapExclamationTriangle,
  bootstrapChevronDown,
  bootstrapArrowRepeat,
} from '@ng-icons/bootstrap-icons';

interface InfoFormState {
  firstName: boolean;
  secondName: boolean;
  thirdName: boolean;
  lastName: boolean;
  mobile: boolean;
  email: boolean;
  grade: boolean;
  parentMobile: boolean;
}

const EMPTY_STATE: InfoFormState = {
  firstName: false,
  secondName: false,
  thirdName: false,
  lastName: false,
  mobile: false,
  email: false,
  grade: false,
  parentMobile: false,
};

@Component({
  selector: 'app-personal-info-card',
  imports: [FormsModule, NgIcon],
  templateUrl: './personal-info-card.component.html',
  viewProviders: [
    provideIcons({
      bootstrapPencilSquare,
      bootstrapPerson,
      bootstrapTelephone,
      bootstrapEnvelope,
      bootstrapMortarboard,
      bootstrapWhatsapp,
      bootstrapExclamationTriangle,
      bootstrapChevronDown,
      bootstrapArrowRepeat,
    }),
  ],
})
export class PersonalInfoCardComponent {
  readonly profile = input.required<StudentProfile>();
  readonly gradeOptions = input.required<GradeOption[]>();
  readonly profileUpdated = output<StudentProfile>();

  private readonly profileService = inject(ProfileService);

  protected readonly isEditing = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly errors = signal<InfoFormState>({ ...EMPTY_STATE });
  protected readonly touched = signal<InfoFormState>({ ...EMPTY_STATE });

  protected form: StudentProfile = {
    firstName: '',
    secondName: '',
    thirdName: '',
    lastName: '',
    mobile: '',
    email: '',
    grade: 0,
    parentMobile: '',
  };

  /** Full display name built from the four name parts. */
  protected fullName(p: StudentProfile = this.profile()): string {
    return [p?.firstName, p?.secondName, p?.thirdName, p?.lastName]
      .filter((part) => !!part && part.trim().length > 0)
      .join(' ');
  }

  protected get initials(): string {
    const first = this.profile()?.firstName?.trim()?.[0] ?? '';
    const last = this.profile()?.lastName?.trim()?.[0] ?? '';
    return first + last;
  }
  protected get grade() {
    return this.gradeOptions().find((g) => g.id === this.profile().grade)?.name;
  }
  protected startEditing(): void {
    this.form = { ...this.profile() };
    this.errors.set({ ...EMPTY_STATE });
    this.touched.set({ ...EMPTY_STATE });
    this.isEditing.set(true);
  }

  protected cancelEditing(): void {
    this.isEditing.set(false);
  }

  protected validateField(field: keyof InfoFormState): void {
    this.touched.update((state) => ({ ...state, [field]: true }));
    this.errors.update((state) => ({ ...state, [field]: !this.isFieldValid(field) }));
  }

  private isFieldValid(field: keyof InfoFormState): boolean {
    switch (field) {
      case 'firstName':
        return !!this.form.firstName?.trim();
      case 'secondName':
        return !!this.form.secondName?.trim();
      case 'thirdName':
        return !!this.form.thirdName?.trim();
      case 'lastName':
        return !!this.form.lastName?.trim();
      case 'mobile':
        return isEgyptianMobile(this.form.mobile);
      case 'email':
        return isValidEmail(this.form.email);
      case 'grade':
        return !!this.form.grade;
      case 'parentMobile':
        return isEgyptianMobile(this.form.parentMobile);
    }
  }

  protected save(): void {
    const fields: (keyof InfoFormState)[] = [
      'firstName',
      'secondName',
      'thirdName',
      'lastName',
      'mobile',
      'email',
      'grade',
      'parentMobile',
    ];
    const nextErrors = { ...EMPTY_STATE };
    fields.forEach((field) => {
      nextErrors[field] = !this.isFieldValid(field);
    });
    this.errors.set(nextErrors);
    this.touched.set({
      firstName: true,
      secondName: true,
      thirdName: true,
      lastName: true,
      mobile: true,
      email: true,
      grade: true,
      parentMobile: true,
    });

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    this.isSaving.set(true);

    this.profileService.updateProfile(this.form).subscribe(() => {
      this.profileUpdated.emit(this.form);
      this.isSaving.set(false);
      this.isEditing.set(false);
      toast.success('تم حفظ بياناتك بنجاح');
    });
  }
}
