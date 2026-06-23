import { Injectable, signal } from '@angular/core';
import { Observable, Subscriber, timer } from 'rxjs';
import { switchMap, takeWhile } from 'rxjs/operators';

export type QuestionType = 'mcq' | 'tf' | 'written';
export type ExtractionState = 'idle' | 'extracting' | 'completed' | 'error';

export interface ExtractedQuestion {
    text: string;
    type: QuestionType;
    options: string[];
    correctIndex: number | null;
    correctBool: boolean | null;
    modelAnswer: string;
    score: number;
}

export interface ExtractionUpdate {
    state?: ExtractionState;
    progress: number; // 0-100
    phase: string;
    currentQuestion?: ExtractedQuestion | null;
    completedQuestions?: ExtractedQuestion[];
}

@Injectable({
    providedIn: 'root',
})
export class AiExamExtractorService {
    private abortController = signal<AbortController | null>(null);

    // ═══════════════════════════════════════════════════════
    // SIMULATION MODE: Replace this with real API call
    // ═══════════════════════════════════════════════════════
    extractQuestionsFromPdf(fileName: string): Observable<ExtractionUpdate> {
        return new Observable((subscriber: Subscriber<ExtractionUpdate>) => {
            const controller = new AbortController();
            this.abortController.set(controller);
            const signal = controller.signal;

            // Demo extracted questions that look realistic
            const demoQuestions: ExtractedQuestion[] = [
                {
                    text: 'أي من التالي يعتبر من الغازات النبيلة؟',
                    type: 'mcq',
                    options: ['النيتروجين', 'الأرجون', 'الأكسجين', 'ثاني أكسيد الكربون'],
                    correctIndex: 1,
                    correctBool: null,
                    modelAnswer: '',
                    score: 2,
                },
                {
                    text: 'الجاذبية الأرضية تزداد كلما اقتربنا من مركز الأرض.',
                    type: 'tf',
                    options: [],
                    correctIndex: null,
                    correctBool: true,
                    modelAnswer: '',
                    score: 1,
                },
                {
                    text: 'اشرح بالتفصيل كيفية تكون البراكين وما هي العوامل المؤثرة في نشاطها؟',
                    type: 'written',
                    options: [],
                    correctIndex: null,
                    correctBool: null,
                    modelAnswer: 'تتكون البراكين نتيجة لحركة الصفائح التكتونية وارتفاع درجة حرارة الصخور المنصهرة في باطن الأرض...',
                    score: 5,
                },
                {
                    text: 'ما هو pH المحايد؟',
                    type: 'mcq',
                    options: ['0', '7', '14', '1'],
                    correctIndex: 1,
                    correctBool: null,
                    modelAnswer: '',
                    score: 2,
                },
                {
                    text: 'الضوء يتبع قانون الانعكاس حيث زاوية السقوط تساوي زاوية الانعكاس.',
                    type: 'tf',
                    options: [],
                    correctIndex: null,
                    correctBool: true,
                    modelAnswer: '',
                    score: 1,
                },
            ];

            const phases = [
                { text: 'جاري قراءة الملف...', duration: 1500 },
                { text: 'جاري تحليل محتوى PDF...', duration: 2000 },
                { text: 'جاري التعرف على الأسئلة...', duration: 2000 },
                { text: 'جاري تصنيف نوع الأسئلة...', duration: 1500 },
                { text: 'جاري استخراج الإجابات...', duration: 2000 },
                { text: 'جاري التحقق من الدقة...', duration: 1500 },
            ];

            let currentPhase = 0;
            let completedQuestions: ExtractedQuestion[] = [];
            const totalQuestions = demoQuestions.length;

            const runPhase = () => {
                if (signal.aborted) {
                    subscriber.complete();
                    return;
                }

                if (currentPhase >= phases.length) {
                    // All phases done, send final completion
                    subscriber.next({
                        state: 'completed',
                        progress: 100,
                        phase: 'تم الانتهاء!',
                        completedQuestions: demoQuestions,
                        currentQuestion: null,
                    });
                    subscriber.complete();
                    return;
                }

                const phase = phases[currentPhase];
                const baseProgress = (currentPhase / phases.length) * 100;

                // Emit phase start
                subscriber.next({
                    progress: Math.round(baseProgress),
                    phase: phase.text,
                    currentQuestion: null,
                    completedQuestions: [...completedQuestions],
                });

                // Simulate finding questions during middle phases
                const questionsInThisPhase = Math.floor(
                    (currentPhase / phases.length) * totalQuestions
                ) - completedQuestions.length;

                if (questionsInThisPhase > 0 && currentPhase >= 2) {
                    // Stream questions one by one with delay
                    let qIndex = 0;
                    const questionTimer = setInterval(() => {
                        if (signal.aborted || qIndex >= questionsInThisPhase) {
                            clearInterval(questionTimer);
                            return;
                        }

                        const question = demoQuestions[completedQuestions.length];
                        if (question) {
                            completedQuestions.push(question);
                            subscriber.next({
                                progress: Math.round(baseProgress + ((qIndex + 1) / questionsInThisPhase) * (100 / phases.length)),
                                phase: `تم استخراج ${toArabicNumerals(completedQuestions.length)} سؤال...`,
                                currentQuestion: question,
                                completedQuestions: [...completedQuestions],
                            });
                        }
                        qIndex++;
                    }, 600);

                    // Move to next phase after this phase duration
                    setTimeout(() => {
                        if (!signal.aborted) {
                            currentPhase++;
                            runPhase();
                        }
                    }, phase.duration);
                } else {
                    setTimeout(() => {
                        if (!signal.aborted) {
                            currentPhase++;
                            runPhase();
                        }
                    }, phase.duration);
                }
            };

            // Start the pipeline
            runPhase();
        });
    }

    cancelExtraction(): void {
        this.abortController()?.abort();
        this.abortController.set(null);
    }

    // ═══════════════════════════════════════════════════════
    // REAL API MODE: Uncomment and use this for production
    // Connects to your backend that streams from OpenAI
    // ═══════════════════════════════════════════════════════
    /*
    extractQuestionsFromPdfReal(fileName: string): Observable<ExtractionUpdate> {
      return new Observable((subscriber: Subscriber<ExtractionUpdate>) => {
        const controller = new AbortController();
        this.abortController.set(controller);
  
        fetch('/api/exams/extract-from-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName }),
          signal: controller.signal,
        })
          .then(async (response) => {
            if (!response.ok) throw new Error('Network response was not ok');
            
            const reader = response.body?.getReader();
            if (!reader) throw new Error('No reader available');
  
            const decoder = new TextDecoder();
            let buffer = '';
  
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
  
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';
  
              for (const line of lines) {
                if (line.trim() === '') continue;
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  if (data === '[DONE]') {
                    subscriber.complete();
                    return;
                  }
                  try {
                    const update: ExtractionUpdate = JSON.parse(data);
                    subscriber.next(update);
                  } catch (e) {
                    console.warn('Failed to parse SSE data:', data);
                  }
                }
              }
            }
            subscriber.complete();
          })
          .catch((err) => {
            if (err.name !== 'AbortError') {
              subscriber.error(err);
            }
          });
      });
    }
    */
}

// Helper for Arabic numerals in service
function toArabicNumerals(num: number): string {
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().split('').map(d => arabicDigits[parseInt(d)] || d).join('');
}