import { Component, computed, input } from '@angular/core';
import { bootstrapPersonFill } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ProfileColor, profileGradient } from '../../../../models/my-profile.model';

/**
 * Mini version of the student-facing hero: gradient background, picture fading into it at the
 * inline-end edge, name / subject / bio at the inline-start. Purely presentational.
 * Swap the two sides by adding `flex-row-reverse`-style classes once the real hero is designed.
 */
@Component({
  selector: 'app-profile-hero-preview',
  imports: [NgIcon, TranslatePipe],
  viewProviders: [provideIcons({ bootstrapPersonFill })],
  templateUrl: './profile-hero-preview.html',
})
export class ProfileHeroPreviewComponent {
  public readonly name = input('');
  public readonly subject = input('');
  public readonly bio = input('');
  public readonly color = input.required<ProfileColor>();
  public readonly pictureUrl = input<string | null>(null);
  /** null hides the badge (not set, or the teacher turned it off). */
  public readonly years = input<number | null>(null);

  protected readonly gradient = computed(() => profileGradient(this.color()));
}