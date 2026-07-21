import { Component, computed, inject, Input } from '@angular/core';
import { ConfigService } from '../../../../core/Services/config';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-nav-logo',
  imports: [RouterLink],
  templateUrl: './nav-logo.html',
  styleUrl: './nav-logo.css',
})
export class NavLogo {
  private readonly configService = inject(ConfigService);

  protected readonly navLogo = computed(() => this.configService.config()?.navLogo);
}
