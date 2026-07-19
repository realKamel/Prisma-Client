import { Component, computed, inject, signal } from '@angular/core';

import { ConfigService } from '../../core/Services/config';

@Component({
  selector: 'app-features-bento',

  templateUrl: './features-bento.html',
})
export class FeaturesBento {
  private configService = inject(ConfigService);

  streakDays = [
    { label: 'س', current: false, missed: false },
    { label: 'إ', current: false, missed: false },
    { label: 'ث', current: false, missed: false },
    { label: 'ر', current: false, missed: false },
    { label: 'خ', current: true, missed: false },
    { label: 'ج', current: false, missed: true },
    { label: 'س', current: false, missed: true },
  ];

  // 2. Updated getter to read from the quizData signal safely
  protected readonly quiz = computed(() => this.configService.config()?.miniQuiz);

  selected: string | null = null;
  answered = false;

  select(optionId: string): void {
    if (this.answered) return;
    this.selected = optionId;
    this.answered = true;
  }

  isCorrect(id: string) {
    return this.answered && id === this.quiz()?.correct;
  }
  isWrong(id: string) {
    return this.answered && id === this.selected && id !== this.quiz()?.correct;
  }
}
