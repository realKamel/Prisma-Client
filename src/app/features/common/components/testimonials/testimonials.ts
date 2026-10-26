import { Component, computed, effect, inject } from '@angular/core';

import { bootstrapHeart } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ConfigService } from '../../../../core/services/configuration/config';

@Component({
  selector: 'app-testimonials',
  imports: [NgIcon],
  templateUrl: './testimonials.html',
  viewProviders: [
    provideIcons({
      bootstrapHeart,
    }),
  ],
})
export class Testimonials {
  private configService = inject(ConfigService);

  protected readonly reviews = computed(() => this.configService.config()?.reviews);

  constructor() {
    effect(() => {
      console.log('config:', this.configService.config());
      console.log('reviews:', this.reviews());
    });
  }
}
