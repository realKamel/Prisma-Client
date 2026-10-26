import { Component, inject } from '@angular/core';
import { bootstrapCheckCircleFill } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ToastService } from '../../../../../../core/services/toast.service';

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
