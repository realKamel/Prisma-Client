import { Component, input, output } from '@angular/core';
import { bootstrapCheckLg } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { TranslatePipe } from '@ngx-translate/core';
import { PROFILE_COLORS, ProfileColor, profileGradient } from '../../../../models/my-profile.model';

/** Radio-style swatches for the page gradient. The parent owns the value (the form control). */
@Component({
  selector: 'app-profile-color-picker',
  imports: [NgIcon, TranslatePipe],
  viewProviders: [provideIcons({ bootstrapCheckLg })],
  templateUrl: "./profile-color-picker.html"
})
export class ProfileColorPickerComponent {
  public readonly value = input.required<ProfileColor>();
  public readonly disabled = input(false);
  public readonly changed = output<ProfileColor>();

  protected readonly colors = PROFILE_COLORS;
  protected readonly gradientOf = profileGradient;
}