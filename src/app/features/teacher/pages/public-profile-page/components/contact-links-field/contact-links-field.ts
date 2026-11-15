import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  bootstrapFacebook,
  bootstrapGlobe,
  bootstrapInstagram,
  bootstrapTelegram,
  bootstrapTiktok,
  bootstrapWhatsapp,
  bootstrapYoutube,
} from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { TranslatePipe } from '@ngx-translate/core';
import { CONTACT_PLATFORMS } from './contact-links';
import { FormErrorComponent } from '../../../../../../shared/components/forms/form-error.component';

/** One input per platform, bound to the `links` form group. Accepts a username or a full link. */
@Component({
  selector: 'app-contact-links-field',
  imports: [ReactiveFormsModule, NgIcon, TranslatePipe, FormErrorComponent],
  viewProviders: [
    provideIcons({
      bootstrapWhatsapp,
      bootstrapFacebook,
      bootstrapInstagram,
      bootstrapYoutube,
      bootstrapTelegram,
      bootstrapTiktok,
      bootstrapGlobe,
    }),
  ],
  templateUrl: "./contact-links-field.html",
})
export class ContactLinksFieldComponent {
  public readonly group = input.required<FormGroup>();
  protected readonly platforms = CONTACT_PLATFORMS;
}