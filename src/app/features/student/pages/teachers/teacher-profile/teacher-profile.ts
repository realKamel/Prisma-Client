import { Component, computed, effect, inject, input, untracked } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  bootstrapArrowLeft,
  bootstrapArrowRight,
  bootstrapAwardFill,
  bootstrapBookFill,
  bootstrapBuilding,
  bootstrapCalendarCheck,
  bootstrapClockFill,
  bootstrapExclamationTriangleFill,
  bootstrapMortarboardFill,
  bootstrapPeopleFill,
  bootstrapPersonFill,
  bootstrapPersonVideo3,
  bootstrapStarFill,
} from '@ng-icons/bootstrap-icons';
import { TeacherProfileStore } from './teacher-profile-store';

@Component({
  selector: 'app-teacher-profile',
  imports: [RouterModule, NgIcon],
  templateUrl: './teacher-profile.html',
  styleUrls: ['./teacher-profile.css'],
  viewProviders: [
    provideIcons({
      bootstrapArrowLeft,
      bootstrapArrowRight,
      bootstrapAwardFill,
      bootstrapBookFill,
      bootstrapBuilding,
      bootstrapCalendarCheck,
      bootstrapClockFill,
      bootstrapExclamationTriangleFill,
      bootstrapMortarboardFill,
      bootstrapPeopleFill,
      bootstrapPersonFill,
      bootstrapPersonVideo3,
      bootstrapStarFill,
    }),
  ],
})
export class TeacherProfileComponent {
  private readonly store = inject(TeacherProfileStore);

  /** Teacher guid coming from the `teacher/:id/profile` route param. */
  readonly id = input.required<string>();

  // Read-only selectors from the signal store
  protected readonly profile = this.store.profile;
  protected readonly isLoading = this.store.isLoading;
  protected readonly error = this.store.error;

  protected readonly fullName = computed(() => {
    const p = this.profile();
    return p ? `${p.firstName} ${p.secondName}` : '';
  });

  protected readonly academicYearsCount = computed(
    () => this.profile()?.academicYears?.length ?? 0,
  );

  constructor() {
    // Load the profile for the current teacher; also reacts to route param changes.
    effect(() => {
      const teacherId = this.id();
      untracked(() => {
        if (teacherId) this.store.loadProfile(teacherId);
      });
    });
  }
}
