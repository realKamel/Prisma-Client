import { Component, computed, inject } from '@angular/core';
import { ConfigService } from '../../core/Services/config';

@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {
    private configService = inject(ConfigService);

  hero = computed(
    () => this.configService.config()?.hero
  );
}
