import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../../core/Services/auth';
import { AppRole } from '../../../../../core/enums/role-enum';

@Component({
  selector: 'app-publish-success-modal',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './publish-success-modal-component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class PublishSuccessModalComponent {
  @Input() open = false;

  @Output() closed = new EventEmitter<void>();
    private router = inject(Router);
    public readonly auth = inject(AuthService);
    private readonly normalizedRole = this.auth.role()?.toString().toLowerCase() as AppRole | undefined;
      navigateToMyLessons() {
      if (this.normalizedRole === AppRole.ASSISTANT) {
        this.router.navigate(['/dashboard/lessons']);
      } else if (this.normalizedRole === AppRole.TEACHER) {
        this.router.navigate(['/dashboard/mylessons']);
      }
}}