import {
    Component, OnInit, OnDestroy, inject, signal, computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { QuizDetailService } from '../../../../core/Services/quiz-detail.service';
import { QuizQuestionComponent as QuizQuestionComponent } from '../quiz-question/quiz-question';
import { QuizDetail as QuizDetailModel, QuizResult, StudentAnswer, SubmitQuizPayload } from '../../../../core/Models/quiz-detail.model';

type QuizState = 'loading' | 'taking' | 'submitting' | 'submitted' | 'graded';

@Component({
    selector: 'app-quiz-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, QuizQuestionComponent],
    templateUrl: './quiz-detail.html',
})
export class QuizDetailComponent implements OnInit, OnDestroy {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private service = inject(QuizDetailService);

    state = signal<QuizState>('loading');
    quiz = signal<QuizDetailModel | null>(null);
    result = signal<QuizResult | null>(null);

    answers = signal<Map<number, StudentAnswer>>(new Map());

    timerDisplay = signal('٣٠:٠٠');
    timerUrgent = signal(false);
    private timerInterval?: ReturnType<typeof setInterval>;
    private remainingSeconds = 0;

    answeredCount = computed(() => this.answers().size);
    totalCount = computed(() => this.quiz()?.questions.length ?? 0);
    progressPct = computed(() =>
        this.totalCount() === 0 ? 0 : Math.round((this.answeredCount() / this.totalCount()) * 100)
    );
    allAnswered = computed(() => this.answeredCount() === this.totalCount() && this.totalCount() > 0);

    scoreClass = computed(() => {
        const s = this.result()?.score ?? 0;
        if (s >= 80) return 'high';
        if (s >= 60) return 'mid';
        return 'low';
    });

    scoreMessage = computed(() => {
        const s = this.result()?.score ?? 0;
        if (s >= 80) return 'ممتاز! أداء قوي جداً';
        if (s >= 60) return 'كويس! في مجال للتحسين';
        return 'محتاج مراجعة تاني';
    });

    ngOnInit(): void {
        const quizId = Number(this.route.snapshot.paramMap.get('id'));
        const isResult = this.route.snapshot.queryParamMap.has('result');

        if (isResult) {
            this.service.getQuizResult(quizId).subscribe(result => {
                this.result.set(result);
                this.state.set('graded');
            });
        } else {
            this.service.getQuizDetail(quizId).subscribe(quiz => {
                this.quiz.set(quiz);
                this.state.set('taking');
                this.startTimer(quiz.durationMinutes * 60);
            });
        }
    }

    ngOnDestroy(): void {
        this.clearTimer();
    }

    onAnswered(answer: StudentAnswer): void {
        const updated = new Map(this.answers());
        if (answer.textAnswer !== undefined && answer.textAnswer.trim().length === 0) {
            updated.delete(answer.questionId);
        } else {
            updated.set(answer.questionId, answer);
        }
        this.answers.set(updated);
    }

    getAnswer(questionId: number): StudentAnswer | null {
        return this.answers().get(questionId) ?? null;
    }

    submitQuiz(): void {
        if (!this.allAnswered() || this.state() !== 'taking') return;

        this.state.set('submitting');
        this.clearTimer();

        const quizId = Number(this.route.snapshot.paramMap.get('id'));
        const payload: SubmitQuizPayload = {
            answers: Array.from(this.answers().values()).map(a => ({
                questionId: a.questionId,
                choiceId: a.choiceId,
                textAnswer: a.textAnswer,
            })),
        };

        this.service.submitQuiz(quizId, payload).subscribe({
            next: () => this.state.set('submitted'),
            error: () => this.state.set('submitted'),
        });
    }

    private autoSubmit(): void {
        if (this.state() === 'taking') {
            this.submitQuiz();
        }
    }

    private startTimer(seconds: number): void {
        this.remainingSeconds = seconds;
        this.updateTimerDisplay();

        this.timerInterval = setInterval(() => {
            this.remainingSeconds--;
            if (this.remainingSeconds <= 0) {
                this.remainingSeconds = 0;
                this.updateTimerDisplay();
                this.clearTimer();
                this.autoSubmit();
                return;
            }
            if (this.remainingSeconds <= 300) this.timerUrgent.set(true);
            this.updateTimerDisplay();
        }, 1000);
    }

    private updateTimerDisplay(): void {
        const m = Math.floor(this.remainingSeconds / 60);
        const s = this.remainingSeconds % 60;
        this.timerDisplay.set(
            `${this.toArabic(m).padStart(2, '٠')}:${this.toArabic(s).padStart(2, '٠')}`
        );
    }

    private clearTimer(): void {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = undefined;
        }
    }

    toArabic(n: number): string {
        return String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);
    }

    posterGradient(variant: string): string {
        const map: Record<string, string> = {
            'pp-energy': 'linear-gradient(135deg,#1a3a4a,#2a6060)',
            'pp-magnet': 'linear-gradient(135deg,#2d1b4e,#4a3080)',
            'pp-wave': 'linear-gradient(135deg,#1a4030,#2d6b50)',
            'pp-atom': 'linear-gradient(135deg,#1a2a4a,#2d4a7a)',
            'pp-thermo': 'linear-gradient(135deg,#3a1a1a,#7a2d2d)',
            'pp-optics': 'linear-gradient(135deg,#1a3a3a,#2d6b6b)',
        };
        return map[variant] ?? map['pp-energy'];
    }

    navigateBack(): void {
        this.router.navigate(['/student/quizzes']);
    }
}