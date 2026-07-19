import { Component, input, Input } from '@angular/core';

import { RouterModule } from '@angular/router';
import { NextLessonDto } from '../../../../../core/Models/Student/Dashboard.Models';

@Component({
  selector: 'app-next-lesson-card',
  imports: [RouterModule],
  templateUrl: './next-lesson-card.html',
})
export class NextLessonCard {
  // @Input({ required: true }) lesson!: NextLessonDto | null;
  readonly lesson = input<NextLessonDto>();
}
