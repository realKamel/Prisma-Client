import { DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgmMotionDirective } from '@scripttype/ng-motion';
import { History } from '../../../../models/history.models';

@Component({
  selector: 'app-history-card',
  imports: [RouterLink, DatePipe, NgmMotionDirective],
  templateUrl: `./card-history.html`,
  styleUrl: './card-history.css',
})
export class HistoryCardComponent {
  public readonly lessonItem = input.required<History>();
  public readonly animationDelay = input(0);
  //FIXME: This is a temporary solution to fix the image URL. The backend should return the full URL instead of just the image name.
  protected readonly lesson = computed(() => {
    const l = this.lessonItem();
    l.imageUrl = `http://localhost:9000/prisma-bucket/${this.lessonItem().imageUrl}`;
    return l;
  });
}
