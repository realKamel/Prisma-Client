import { Component, inject } from '@angular/core';
import { ThemeService } from '../../../../../../core/Services/theme';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-theme-toggle',
  imports: [TranslatePipe],
  templateUrl: './theme-toggle.html',
  styleUrl: './theme-toggle.css',
})
export class ThemeToggleComponent {
  protected readonly theme = inject(ThemeService);
}
