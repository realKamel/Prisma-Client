import { Component, input, Input, output } from '@angular/core';

import { RouterModule } from '@angular/router';
import { QuizListItem } from '../../../../core/Models/quiz-model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-quiz-card',

  imports: [RouterModule, DatePipe],
  templateUrl: './quiz-card.html',
})
export class QuizCard {
  // TODO: Skipped for migration because:
  //  This input is used in a control flow expression (e.g. `@if` or `*ngIf`)
  //  and migrating would break narrowing currently.

  // @Input() quiz!: QuizListItem;
  readonly quiz = input<QuizListItem>();
  readonly showPendingModal = output<void>();

  get scoreStyle(): string {
    const pct = ((this.quiz()?.score ?? 0) / (this.quiz()?.totalDegree || 1)) * 100;
    if (pct >= 80) return 'background:rgba(78,203,141,0.12); color:var(--mint)';
    if (pct >= 60) return 'background:rgba(247,201,72,0.12); color:var(--star)';
    return 'background:rgba(240,106,106,0.08); color:var(--coral)';
  }

  get posterGradient(): string {
    const map: Record<string, string> = {
      'pp-energy': 'linear-gradient(135deg,#1a3a4a,#2a6060)',
      'pp-magnet': 'linear-gradient(135deg,#2d1b4e,#4a3080)',
      'pp-wave': 'linear-gradient(135deg,#1a4030,#2d6b50)',
      'pp-atom': 'linear-gradient(135deg,#1a2a4a,#2d4a7a)',
      'pp-thermo': 'linear-gradient(135deg,#3a1a1a,#7a2d2d)',
      'pp-optics': 'linear-gradient(135deg,#1a3a3a,#2d6b6b)',
    };
    return map[this.quiz()?.posterVariant ?? 0] ?? map['pp-energy'];
  }
}
