import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ConfigService } from '../../../../../../core/Services/config';

@Component({
  selector: 'app-nav-logo',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './nav-logo.html',
  styleUrl: './nav-logo.css',
})
export class NavLogoComponent {
  private readonly configService = inject(ConfigService);

  protected readonly navLogo = computed(() => this.configService.config()?.navLogo);
}
