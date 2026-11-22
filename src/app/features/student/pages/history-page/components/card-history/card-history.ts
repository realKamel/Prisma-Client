import { DatePipe } from '@angular/common';
import { Component, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { History } from '../../../../models/history.models';
import { ImagePlaceholderDirective } from '../../../../../../shared/directives/Image-placeholder/image-placeholder.directive';

@Component({
  selector: 'app-history-card',
  imports: [RouterLink, DatePipe, NgmMotionDirective, ImagePlaceholderDirective],
  templateUrl: `./card-history.html`,
})
export class HistoryCardComponent {
  public readonly lesson = input.required<History>();
  public readonly animationDelay = input(0);
  imageError = signal(false);
}
