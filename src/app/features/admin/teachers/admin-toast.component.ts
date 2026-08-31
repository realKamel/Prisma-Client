import { Component, input } from '@angular/core';
import { ToastState } from '../../../core/Models/Admin/teachers-admin.types';

@Component({
  selector: 'app-admin-toast',
  templateUrl: './admin-toast.component.html',
})
export class AdminToastComponent {
  readonly toast = input<ToastState>();
}
