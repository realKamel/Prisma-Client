import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../../../core/Services/language';

@Component({
  selector: 'app-auth-buttons',
  imports: [RouterLink],
  templateUrl: './auth-buttons.html',
  styleUrl: './auth-buttons.css',
})
export class AuthButtons {
  private readonly translate = inject(TranslateService);
  private readonly langService = inject(LanguageService);
  private readonly _ = computed(() => this.langService.lang());
  protected readonly loginLabel = computed(() => {
    this._();
    return this.translate.instant('NAVBAR.LOGIN');
  });
  protected readonly registerLabel = computed(() => {
    this._();
    return this.translate.instant('NAVBAR.REGISTER');
  });
}
