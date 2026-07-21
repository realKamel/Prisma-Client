import { Component, input } from '@angular/core';
import { History } from '../../../models/history.models';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-history-card',
  imports: [RouterLink, DatePipe],
  templateUrl: `./card-history.html`,
  styleUrl: './card-history.css',
})
export class HistoryCardComponent {
  public lesson = input.required<History>();
}
