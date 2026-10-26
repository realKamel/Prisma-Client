import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { bootstrapArrowRepeat } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { forkJoin } from 'rxjs';
import {
  cardEntranceTransition,
  pageEntranceAnimate,
  pageEntranceInitial,
  pageEntranceTransition,
  stateSwapTransition,
} from '../../../../core/animations/motion.animations';
import { GradeOption, StudentProfile } from '../../../../core/models/student/student-profile.model';
import { ProfileService } from '../../../../core/services/profile.service';
import { ChangePasswordCardComponent } from './components/change-password-card/change-password-card.component';
import { PersonalInfoCardComponent } from './components/personal-info-card/personal-info-card.component';

@Component({
  selector: 'app-profile',
  imports: [
    PersonalInfoCardComponent,
    ChangePasswordCardComponent,
    RouterLink,
    NgIcon,
    NgmMotionDirective,
  ],
  templateUrl: './profile.component.html',
  viewProviders: [
    provideIcons({
      bootstrapArrowRepeat,
    }),
  ],
})
export class ProfilePageComponent implements OnInit {
  private readonly profileService = inject(ProfileService);

  protected readonly pageInitial = pageEntranceInitial;
  protected readonly pageAnimate = pageEntranceAnimate;
  protected readonly pageTransition = pageEntranceTransition;
  protected readonly cardTransition = cardEntranceTransition;
  protected readonly stateTransition = stateSwapTransition;

  protected readonly profile = signal<StudentProfile | null>(null);
  protected readonly gradeOptions = signal<GradeOption[]>([]);
  protected readonly isLoading = signal(true);

  ngOnInit(): void {
    forkJoin({
      profile: this.profileService.loadProfile(),
      gradeOptions: this.profileService.loadGradeOptions(),
    }).subscribe(({ profile, gradeOptions }) => {
      this.profile.set(profile);
      this.gradeOptions.set(gradeOptions);
      this.isLoading.set(false);
    });
  }

  protected onProfileUpdated(updated: StudentProfile): void {
    this.profile.set(updated);
  }
}
