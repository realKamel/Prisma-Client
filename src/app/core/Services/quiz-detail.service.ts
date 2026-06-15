import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { QuizDetail, QuizResult, SubmitQuizPayload } from '../Models/quiz-detail.model';
import { environment } from '../../../environments/environment';

const USE_STATIC = true;

// ─── STATIC FALLBACK DATA ─────────────────────────────────────────────────────
const STATIC_QUIZ: QuizDetail = {
    id: 1,
    title: 'اختبار دوري: مراجعة الفصل الثاني',
    lessonTitle: 'الفصل الثاني',
    teacherName: 'أ. فاطمة علي',
    durationMinutes: 30,
    totalDegree: 10,
    posterVariant: 'pp-optics',
    iconType: 'eye',
    questions: [
        {
            id: 1,
            type: 'mcq',
            title: 'ما هي وحدة الشحنة الكهربائية في النظام الدولي للوحدات؟',
            degree: 2,
            choices: [
                { id: 1, text: 'الكولوم (C)' },
                { id: 2, text: 'الفولت (V)' },
                { id: 3, text: 'الأمبير (A)' },
                { id: 4, text: 'الواط (W)' },
            ],
        },
        {
            id: 2,
            type: 'truefalse',
            title: 'سرعة الضوء في الفراغ تساوي ٣×١٠⁸ م/ث',
            degree: 2,
            choices: [
                { id: 5, text: 'صح' },
                { id: 6, text: 'غلط' },
            ],
        },
        {
            id: 3,
            type: 'written',
            title: 'اشرح قانون أوم وكيف يربط الجهد بالتيار والمقاومة',
            degree: 6,
            choices: [],
        },
    ],
};

const STATIC_RESULT: QuizResult = {
    quizTitle: 'اختبار دوري: مراجعة الفصل الأول',
    score: 86,
    totalDegree: 10,
    scoredDegree: 8.6,
    correctCount: 2,
    wrongCount: 1,
    gradedAt: '٢٥ مارس ٢٠٢٦',
    answers: [
        {
            questionId: 1,
            questionTitle: 'ما هي وحدة الشحنة الكهربائية في النظام الدولي للوحدات؟',
            questionType: 'mcq',
            choices: [
                { id: 1, text: 'الكولوم (C)' },
                { id: 2, text: 'الفولت (V)' },
                { id: 3, text: 'الأمبير (A)' },
                { id: 4, text: 'الواط (W)' },
            ],
            correctChoiceId: 1,
            studentChoiceId: 1,
            isCorrect: true,
            degree: 2,
            scoredDegree: 2,
        },
        {
            questionId: 2,
            questionTitle: 'سرعة الضوء في الفراغ تساوي ٣×١٠⁸ م/ث',
            questionType: 'truefalse',
            choices: [
                { id: 5, text: 'صح' },
                { id: 6, text: 'غلط' },
            ],
            correctChoiceId: 5,
            studentChoiceId: 6,
            isCorrect: false,
            degree: 2,
            scoredDegree: 0,
        },
        {
            questionId: 3,
            questionTitle: 'اشرح قانون أوم وكيف يربط الجهد بالتيار والمقاومة',
            questionType: 'written',
            choices: [],
            studentTextAnswer: 'قانون أوم ينص على أن V = IR حيث V هو الجهد وI هو التيار وR هي المقاومة',
            isCorrect: true,
            degree: 6,
            scoredDegree: 6.6,
        },
    ],
};
// ─────────────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class QuizDetailService {
    private http = inject(HttpClient);

    getQuizDetail(quizId: number): Observable<QuizDetail> {
        if (USE_STATIC) return of(STATIC_QUIZ);

        return this.http
            .get<QuizDetail>(`${environment.apiUrl}/students/quizzes/${quizId}`)
            .pipe(catchError(() => of(STATIC_QUIZ)));
    }

    submitQuiz(quizId: number, payload: SubmitQuizPayload): Observable<void> {
        if (USE_STATIC) return of(undefined);

        return this.http
            .post<void>(`${environment.apiUrl}/students/quizzes/${quizId}/submit`, payload);
    }

    getQuizResult(quizId: number): Observable<QuizResult> {
        if (USE_STATIC) return of(STATIC_RESULT);

        return this.http
            .get<QuizResult>(`${environment.apiUrl}/students/quizzes/${quizId}/result`)
            .pipe(catchError(() => of(STATIC_RESULT)));
    }
}