import { Component, computed, inject } from '@angular/core';
import { ThemeService } from '../../../../../../core/Services/theme';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../../../core/Services/language';
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
  private readonly translate = inject(TranslateService);
  private readonly langService = inject(LanguageService);
  private readonly lang = computed(() => this.langService.lang());
  protected readonly toggleLabel = computed(() => {
    this.lang();
    return this.translate.instant('NAVBAR.TOGGLE_THEME');
  });
}
