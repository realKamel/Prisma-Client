import { Component, input } from '@angular/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { ToastState } from '../../../core/Models/Admin/teachers-admin.types';

@Component({
  selector: 'app-admin-toast',
  imports: [NgmMotionDirective],
  templateUrl: './admin-toast.component.html',
})
export class AdminToastComponent {
  readonly toast = input<ToastState>();
}
