import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';

import { PersonalInfoCardComponent } from './components/personal-info-card/personal-info-card.component';
import { ChangePasswordCardComponent } from './components/change-password-card/change-password-card.component';
import { ProfileService } from '../../../core/Services/profile.service';
import { GradeOption, StudentProfile } from '../../../core/Models/Student/student-profile.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [PersonalInfoCardComponent, ChangePasswordCardComponent],
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit {
  private readonly profileService = inject(ProfileService);

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
