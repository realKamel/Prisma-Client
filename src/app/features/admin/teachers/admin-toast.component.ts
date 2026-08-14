import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastState } from '../../../core/Models/Admin/teachers-admin.types';

@Component({
  selector: 'app-admin-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-toast.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class AdminToastComponent {
  @Input() toast: ToastState | null = null;
}
