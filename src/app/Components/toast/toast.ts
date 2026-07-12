import { Component, inject } from '@angular/core';
import { ToastService } from '../../core/Services/toast-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast',
  imports: [CommonModule],
  templateUrl: './toast.html',
})
export class Toast {
    readonly svc = inject(ToastService);

}
