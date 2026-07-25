import { Component, computed, inject } from '@angular/core';
import { ConfigService } from '../../../../core/Services/config';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero',
  imports: [RouterLink],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {
  private configService = inject(ConfigService);

  protected readonly hero = computed(() => this.configService.config()?.hero);
}
