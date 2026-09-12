import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { NgmMotionDirective } from '@scripttype/ng-motion';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.html',
  imports: [DatePipe, NgmMotionDirective],
})
export class PageHeaderComponent {
  readonly pageDateLabel = input.required<string>();
}
