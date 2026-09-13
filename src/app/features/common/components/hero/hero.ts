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
import { UtilButtonComponent } from '../../../../shared/components/util-button/util-button.component';
import {
  ambientLoopTransition,
  heroEntranceInitial,
  heroEntranceTransition,
  infiniteRepeat,
  pulseLoopTransition,
} from '../../../../core/animations/motion.animations';

@Component({
  selector: 'app-hero',
  imports: [RouterLink, NgIcon, NgmMotionDirective, UtilButtonComponent],
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
  protected readonly entranceInitial = heroEntranceInitial;
  protected readonly infiniteRepeat = infiniteRepeat;
  protected readonly entranceTransition = heroEntranceTransition;
  protected readonly ambientTransition = ambientLoopTransition;
  protected readonly pulseTransition = pulseLoopTransition;
}
