import { Component, inject } from '@angular/core';
import { ToastService } from '../../../../../core/Services/toast.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapCheckCircleFill } from '@ng-icons/bootstrap-icons';

@Component({
  selector: 'app-toast',
  imports: [NgIcon],
  templateUrl: './toast.component.html',
  viewProviders: [
    provideIcons({
      bootstrapCheckCircleFill,
    }),
  ],
})
export class ToastComponent {
  protected readonly toastService = inject(ToastService);
}
