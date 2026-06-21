// dashboard/components/next-lesson-card/next-lesson-card.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NextLessonDto } from '../../../../../core/Models/Student/Dashboard.Models';

@Component({
  selector: 'app-next-lesson-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './next-lesson-card.html',
})
export class NextLessonCard {
  @Input({ required: true }) lesson!: NextLessonDto | null;
}