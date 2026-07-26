import { Component, computed, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  bootstrapPatchCheckFill,
  bootstrapCalendarCheck,
  bootstrapLightningCharge,
  bootstrapStarFill,
} from '@ng-icons/bootstrap-icons';
import { ConfigService } from '../../../../core/Services/config';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero',
  imports: [RouterLink, NgIcon],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
  viewProviders: [
    provideIcons({
      bootstrapPatchCheckFill,
      bootstrapCalendarCheck,
      bootstrapLightningCharge,
      bootstrapStarFill,
    }),
  ],
})
export class Hero {
  private configService = inject(ConfigService);

  protected readonly hero = computed(() => this.configService.config()?.hero);
}
