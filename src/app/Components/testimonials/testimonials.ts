import { ChangeDetectorRef, Component, computed, effect, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigService } from '../../core/Services/config';

interface Review {
  stars: string;
  body: string;
  avatar: string;
  name: string;
  role: string;
}

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonials.html',
})
export class Testimonials {
  private configService = inject(ConfigService);

  reviews = computed(() => this.configService.config()?.reviews);;

  constructor() {
  effect(() => {
    console.log('config:', this.configService.config());
    console.log('reviews:', this.reviews());
  });
}
}
