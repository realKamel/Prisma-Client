import { Component, input } from '@angular/core';
import { bootstrapSpeedometer2 } from '@ng-icons/bootstrap-icons';
import { provideIcons } from '@ng-icons/core';
import { TranslatePipe } from '@ngx-translate/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';

@Component({
  selector: 'app-log-page-header',
  templateUrl: './log-page-header.component.html',
  imports: [TranslatePipe, NgmMotionDirective],
  viewProviders: [
    provideIcons({
      bootstrapSpeedometer2,
    }),
  ],
})
export class LogPageHeaderComponent {
  readonly title = input();
  readonly subtitle = input();
  // readonly backLabel = input('SIDEBAR.DASHBOARD');
}
