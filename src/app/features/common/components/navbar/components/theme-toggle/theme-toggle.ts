import { Component, inject } from '@angular/core';
import { ThemeService } from '../../../../../../core/Services/theme';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMoon, lucideSun } from '@ng-icons/lucide';

@Component({
  selector: 'app-theme-toggle',
  imports: [NgIcon],
  templateUrl: './theme-toggle.html',
  styleUrl: './theme-toggle.css',
  viewProviders: [provideIcons({ lucideSun, lucideMoon })],
})
export class ThemeToggle {
  protected readonly theme = inject(ThemeService);
}
