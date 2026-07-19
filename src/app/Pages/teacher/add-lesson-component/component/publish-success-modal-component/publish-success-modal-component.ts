import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';

import { Router, RouterLink } from '@angular/router';
import { AppRole } from '../../../../../core/enums/role-enum';
import { AuthService } from '../../../../../core/Services/auth';

@Component({
  selector: 'app-publish-success-modal-add',

  imports: [],
  templateUrl: './publish-success-modal-component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class PublishSuccessModalAddComponent {
  readonly open = input(false);

  readonly closed = output<void>();
  private router = inject(Router);
  public readonly auth = inject(AuthService);
  private readonly normalizedRole = this.auth.role()?.toString().toLowerCase() as
    AppRole | undefined;
  navigateToMyLessons() {
    if (this.normalizedRole === AppRole.ASSISTANT) {
      this.router.navigate(['/dashboard/lessons']);
    } else if (this.normalizedRole === AppRole.TEACHER || this.normalizedRole === AppRole.ADMIN) {
      this.router.navigate(['/dashboard/mylessons']);
    }
  }
}
