import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface QuizDetails {
  id: string;
  questionsCount: number;
  durationMinutes: number;
  passingScore: number;
}

@Component({
  selector: 'app-quiz-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz-tab.html'
})
export class QuizTab implements OnInit {
  // استقبال الـ id العام للدرس ومواصفات الاختبار المخصصة من الـ JSON
  @Input() lessonId!: string | number;
  @Input() quizDetails!: QuizDetails;

  isQuizCompleted: boolean = false;
  isLoading: boolean = false;
  btnText: string = 'ابدأ الاختبار التقييمي الآن';
  quizScore: string = '0';
  
  private storageKey!: string;

  ngOnInit(): void {
    // بناء مفتاح تخزين فريد مخصص لهذا الدرس لمنع التداخل بين الدروس
    this.storageKey = `quiz_status_lesson_${this.lessonId}`;

    const localScore = localStorage.getItem(this.storageKey);
    if (localScore) {
      this.quizScore = localScore;
      this.isQuizCompleted = true;
    } else {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('quiz') === 'done') {
        const score = urlParams.get('score') || '85';
        localStorage.setItem(this.storageKey, score);
        this.quizScore = score;
        this.isQuizCompleted = true;
        
        // تنظيف الرابط بشكل آمن
        window.history.replaceState(null, '', window.location.pathname + '#tab-quiz-btn');
      }
    }
  }

  startQuiz(): void {
    this.isLoading = true;
    this.btnText = 'جاري التحميل...';
    setTimeout(() => {
      // توجيه المستخدم إلى صفحة الاختبار مع تمرير معرف الاختبار الديناميكي إذا لزم الأمر
      window.location.href = `61-exam-detail.html?from=player&quizId=${this.quizDetails?.id || ''}`;
    }, 600);
  }
}