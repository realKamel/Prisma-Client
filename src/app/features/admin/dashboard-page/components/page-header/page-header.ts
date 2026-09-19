import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.html',
  imports: [DatePipe, NgmMotionDirective, TranslatePipe],
})
export class PageHeaderComponent {
  public readonly pageDateLabel = input.required<string>();
}
