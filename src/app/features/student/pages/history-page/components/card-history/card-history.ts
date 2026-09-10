import { Component, input } from '@angular/core';
import { History } from '../../../../models/history.models';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { NgmMotionDirective } from '@scripttype/ng-motion';

@Component({
  selector: 'app-history-card',
  imports: [RouterLink, DatePipe, NgmMotionDirective],
  templateUrl: `./card-history.html`,
  styleUrl: './card-history.css',
})
export class HistoryCardComponent {
  public lesson = input.required<History>();
  public animationDelay = input(0);
}
