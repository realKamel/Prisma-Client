import { Component, computed, effect, inject, OnInit } from '@angular/core';

import { ConfigService } from '../../core/Services/config';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapHeart } from '@ng-icons/bootstrap-icons';

interface Review {
  stars: string;
  body: string;
  avatar: string;
  name: string;
  role: string;
}

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

  reviews = computed(() => this.configService.config()?.reviews);

  constructor() {
    effect(() => {
      console.log('config:', this.configService.config());
      console.log('reviews:', this.reviews());
    });
  }
}
