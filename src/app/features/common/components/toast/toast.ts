import { Component, inject } from '@angular/core';
import { ToastService } from '../../../../core/Services/toast-service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.html',
})
export class Toast {
  readonly svc = inject(ToastService);
}
