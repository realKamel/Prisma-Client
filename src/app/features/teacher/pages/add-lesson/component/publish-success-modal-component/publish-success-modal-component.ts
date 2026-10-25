import { Component, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';
import { bootstrapCheckLg } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { AppRole } from '../../../../../../core/enums/role-enum';
import { AuthService } from '../../../../../../core/Services/auth';

@Component({
  selector: 'app-publish-success-modal-add',
  imports: [NgIcon],
  templateUrl: './publish-success-modal-component.html',
  viewProviders: [
    provideIcons({
      bootstrapCheckLg,
    }),
  ],
})
export class PublishSuccessModalAddComponent {
  public readonly open = input(false);
  public readonly closed = output<void>();
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
