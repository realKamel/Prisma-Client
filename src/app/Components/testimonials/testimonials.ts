import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigService } from '../../core/Services/config';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonials.html',
})
export class Testimonials {
  private configService = inject(ConfigService);

  reviews = computed(() => {
    return this.configService.config()?.reviews ?? [];
  });
}