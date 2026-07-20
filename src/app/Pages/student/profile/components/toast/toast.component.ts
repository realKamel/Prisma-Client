import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../../../../../core/Services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  templateUrl: './toast.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  protected readonly toastService = inject(ToastService);
}
