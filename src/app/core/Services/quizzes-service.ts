import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { Quiz, QuizStats } from '../Models/quiz-model';
import { AuthService } from '../Services/auth'; 
import { environment } from '../../../environments/environment';

const USE_STATIC = true;

const STATIC_QUIZZES: Quiz[] = [
    {
        id: '1',
        title: 'اختبار دوري: مراجعة الفصل الثاني',
        date: '١٥ مايو ٢٠٢٦',
        questionCount: 5,
        durationMinutes: 30,
        status: 'new',
        posterVariant: 'pp-optics',
        iconType: 'eye',
    },
    {
        id: '2',
        title: 'اختبار دوري: منتصف الفصل الثاني',
        date: '٢ مايو ٢٠٢٦',
        submittedDate: '٣ مايو ٢٠٢٦',
        status: 'pending',
        posterVariant: 'pp-atom',
        iconType: 'atom',
    },
    {
        id: '3',
        title: 'اختبار دوري: مراجعة الفصل الأول',
        date: '٢٥ مارس ٢٠٢٦',
        status: 'done',
        score: 86,
        maxScore: 100,
        posterVariant: 'pp-energy',
        iconType: 'bolt',
    },
    {
        id: '4',
        title: 'اختبار دوري: اختبار شهر مارس',
        date: '١٠ مارس ٢٠٢٦',
        status: 'done',
        score: 72,
        maxScore: 100,
        posterVariant: 'pp-magnet',
        iconType: 'magnet',
    },
    {
        id: '5',
        title: 'اختبار دوري: اختبار الفصل الأول',
        date: '١٥ فبراير ٢٠٢٦',
        status: 'missed',
        posterVariant: 'pp-thermo',
        iconType: 'thermo',
    },
];
@Injectable({ providedIn: 'root' })
export class QuizzesService {
    private http = inject(HttpClient);
    private auth = inject(AuthService);
    getStudentQuizzes(): Observable<Quiz[]> {
        if (USE_STATIC) {
            return of(STATIC_QUIZZES);
        }

        if (!this.auth.isLoggedIn()) {
            return of(STATIC_QUIZZES);
        }

        const email = this.auth.email();

        return this.http
            .get<Quiz[]>(`${environment.apiUrl}/students/quizzes`, {
                params: { email: email ?? '' },
            })
            .pipe(catchError(() => of(STATIC_QUIZZES)));
    }

    computeStats(quizzes: Quiz[]): QuizStats {
        const done = quizzes.filter(q => q.status === 'done');
        const scores = done.map(q => ((q.score ?? 0) / (q.maxScore ?? 100)) * 100);
        return {
            total: quizzes.length,
            avgScore: scores.length
                ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
                : 0,
            bestScore: scores.length ? Math.round(Math.max(...scores)) : 0,
            newCount: quizzes.filter(q => q.status === 'new').length,
        };
    }
}