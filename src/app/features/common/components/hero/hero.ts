import { Component, computed, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
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
  imports: [RouterLink, NgIcon, NgmMotionDirective],
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
export class HeroComponent {
  private configService = inject(ConfigService);

  protected readonly hero = computed(() => this.configService.config()?.hero);
  protected readonly entranceInitial = { opacity: 0, y: 32 };
  protected readonly infiniteRepeat = Infinity;
  protected readonly entranceTransition = { type: 'spring', stiffness: 280, damping: 26 } as const;
  protected readonly ambientTransition = {
    duration: 8,
    ease: 'easeInOut',
    repeat: Infinity,
  } as const;
  protected readonly pulseTransition = {
    duration: 2,
    ease: 'easeInOut',
    repeat: Infinity,
  } as const;
}
