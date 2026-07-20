import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NextLessonDto } from '../../../../../core/Models/Student/Dashboard.Models';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapArrowLeft } from '@ng-icons/bootstrap-icons';

@Component({
  selector: 'app-next-lesson-card',
  imports: [RouterModule, NgIcon],
  templateUrl: './next-lesson-card.html',
  viewProviders: [
    provideIcons({
      bootstrapArrowLeft,
    }),
  ],
})
export class NextLessonCard {
  readonly lesson = input<NextLessonDto>();
}
