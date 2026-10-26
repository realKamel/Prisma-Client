import { Component, inject, input, model, output } from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck } from '@ng-icons/lucide';
import { AppRole } from '../../../../../../core/enums/role-enum';
import { AuthService } from '../../../../../../core/services/auth/auth';

@Component({
  selector: 'app-publish-success-modal',
  imports: [NgIcon],
  templateUrl: './publish-success-modal-component.html',
  viewProviders: [provideIcons({ lucideCheck })],
})
export class PublishSuccessModalComponent {
  public readonly open = input(false);
  public readonly closed = output<void>();
  public readonly isOpened = model<boolean>();
  private router = inject(Router);
  public readonly auth = inject(AuthService);
  private readonly normalizedRole = this.auth.role()?.toString().toLowerCase() as
    AppRole | undefined;
  protected navigateToMyLessons() {
    if (this.normalizedRole === AppRole.ASSISTANT) {
      void this.router.navigate(['/dashboard/lessons']);
    } else if (this.normalizedRole === AppRole.TEACHER || this.normalizedRole === AppRole.ADMIN) {
      void this.router.navigate(['/dashboard/mylessons']);
    }
  }
}
