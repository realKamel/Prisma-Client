import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideFlame, lucideX } from '@ng-icons/lucide';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { toast } from 'ngx-sonner';
import { PracticeAnswerResult, PracticeQuestion } from '../../models/dashboard.models';
import { DashboardService } from '../dashboard/services/dashboard.service';

type State = 'loading' | 'empty' | 'error' | 'playing' | 'done' | 'practiced';

@Component({
  selector: 'app-practice-round',
  templateUrl: './practice-round.html',
  imports: [RouterLink, NgIcon, TranslatePipe],
  viewProviders: [provideIcons({ lucideFlame, lucideCheck, lucideX })],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PracticeRound implements OnInit {
  private readonly api = inject(DashboardService);
  private readonly translate = inject(TranslateService);

  protected readonly state = signal<State>('loading');
  protected readonly questions = signal<PracticeQuestion[]>([]);
  protected readonly index = signal(0);
  protected readonly picked = signal<number | null>(null);
  protected readonly result = signal<PracticeAnswerResult | null>(null);
  protected readonly outcomes = signal<('right' | 'wrong')[]>([]);
  protected readonly busy = signal(false);
  protected readonly streakCounted = signal(false);

  protected readonly current = computed(() => this.questions()[this.index()] ?? null);
  /** One-item list so @for re-creates (and re-animates) the card on every question. */
  protected readonly visible = computed(() => {
    const q = this.current();
    return q ? [q] : [];
  });
  protected readonly isLast = computed(() => this.index() === this.questions().length - 1);
  protected readonly score = computed(() => this.outcomes().filter((o) => o === 'right').length);
  protected readonly doneKey = computed(() => {
    const ratio = this.score() / Math.max(1, this.questions().length);
    return ratio >= 0.8 ? 'PRACTICE.DONE_HIGH' : ratio >= 0.5 ? 'PRACTICE.DONE_MID' : 'PRACTICE.DONE_LOW';
  });

  ngOnInit(): void {
    this.api.getPracticeRound().subscribe({
      next: (r) => {
        this.questions.set(r.questions);
        this.state.set(r.practicedToday ? 'practiced' : r.questions.length ? 'playing' : 'empty');
      },
      error: () => this.state.set('error'),
    });
  }

  protected pick(choiceId: number): void {
    const q = this.current();
    if (!q || this.busy() || this.result()) return;

    this.picked.set(choiceId);
    this.busy.set(true);

    this.api.answerPractice({ questionId: q.questionId, choiceId }).subscribe({
      next: (r) => {
        this.result.set(r);
        this.outcomes.update((o) => [...o, r.isCorrect ? 'right' : 'wrong']);
        this.busy.set(false);
      },
      error: () => {
        this.picked.set(null);
        this.busy.set(false);
        toast.error(this.translate.instant('PRACTICE.ERROR'));
      },
    });
  }

protected next(): void {
  if (this.busy() || !this.result()) return;

  if (this.isLast()) {
    this.busy.set(true);

    this.api.finishPractice().subscribe({
      next: (r) => {
        if (r.streakCounted) {
          this.streakCounted.set(true);
        }

        this.busy.set(false);
        this.state.set('done');
      },
      error: () => {
        this.busy.set(false);
        toast.error(this.translate.instant('PRACTICE.ERROR'));
      },
    });

    return;
  }

  this.index.update((i) => i + 1);
  this.picked.set(null);
  this.result.set(null);
}

  protected dotCls(i: number): string {
    const o = this.outcomes()[i];
    if (o === 'right') return 'bg-mint';
    if (o === 'wrong') return 'bg-coral';
    return i === this.index() ? 'bg-primary-light' : 'bg-[rgba(var(--color-primary-rgb),0.18)]';
  }

  protected choiceCls(id: number): string {
    const r = this.result();
    if (!r) {
      return id === this.picked()
        ? 'border-border-focus text-ink'
        : 'border-border text-ink-subtle hover:border-border-focus hover:text-ink';
    }
    if (id === r.correctChoiceId) return 'border-mint bg-mint/10 text-mint';
    if (id === this.picked()) return 'border-coral bg-coral/10 text-coral animate-shake';
    return 'border-border text-muted opacity-50';
  }
}