import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AppRole } from '../../../../../core/enums/role-enum';
import { AuthService } from '../../../../../core/Services/auth';

@Component({
  selector: 'app-publish-success-modal-add',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './publish-success-modal-component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class PublishSuccessModalAddComponent {
  @Input() open = false;

  @Output() closed = new EventEmitter<void>();
    private router = inject(Router);
    public readonly auth = inject(AuthService);
    private readonly normalizedRole = this.auth.role()?.toString().toLowerCase() as AppRole | undefined;
      navigateToMyLessons() {
      if (this.normalizedRole === AppRole.ASSISTANT) {
        this.router.navigate(['/dashboard/lessons']);
      } else if (this.normalizedRole === AppRole.TEACHER || this.normalizedRole === AppRole.ADMIN) {
        this.router.navigate(['/dashboard/mylessons']);
      }
}}
