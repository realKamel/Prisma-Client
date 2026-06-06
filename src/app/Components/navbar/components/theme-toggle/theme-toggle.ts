import { Component, inject } from '@angular/core';
import { ThemeService } from '../../../../core/Services/theme';

@Component({
  selector: 'app-theme-toggle',
  imports: [],
  templateUrl: './theme-toggle.html',
  styleUrl: './theme-toggle.css',
})
export class ThemeToggle {
  theme = inject(ThemeService);
}
