import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import {
  ExtractedChoiceDto,
  ExtractedQuestionDto,
  ExtractionUpdate,
} from '../Models/ai-exam-extractor.model';

@Service()
export class AiExamExtractorService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/v1/teacher/quizzes/extract';

  async extractQuestionsFromPdf(file: File): Promise<Observable<ExtractionUpdate>> {
    const updateSubject = new Subject<ExtractionUpdate>();

    const formData = new FormData();
    formData.append('file', file);

    try {
      const uploadResponse = await this.http
        .post<{ jobId: string; fileName: string }>(`${this.apiUrl}/upload`, formData)
        .toPromise();

      if (!uploadResponse?.jobId) {
        updateSubject.next({
          state: 'error',
          progress: 0,
          phase: 'فشل رفع الملف',
          error: 'Upload failed',
          completedQuestions: [],
        });
        updateSubject.complete();
        return updateSubject.asObservable();
      }

      const jobId = uploadResponse.jobId;
      this.pollExtractionStatus(jobId, updateSubject);
    } catch (error: any) {
      updateSubject.next({
        state: 'error',
        progress: 0,
        phase: 'فشل الاتصال بالخادم',
        error: error?.message || 'Connection failed',
        completedQuestions: [],
      });
      updateSubject.complete();
    }

    return updateSubject.asObservable();
  }

  private pollExtractionStatus(jobId: string, subject: Subject<ExtractionUpdate>): void {
    const interval = setInterval(async () => {
      try {
        const data = await this.http
          .get<ExtractionUpdate>(`${this.apiUrl}/status/${jobId}`)
          .toPromise();

        if (!data) {
          return;
        }

        subject.next(data);

        if (data.state === 'completed' || data.state === 'failed' || data.state === 'cancelled') {
          clearInterval(interval);
          subject.complete();
        }
      } catch (error) {
        clearInterval(interval);
        subject.next({
          state: 'error',
          progress: 0,
          phase: 'انقطع الاتصال',
          error: 'Connection error',
          completedQuestions: [],
        });
        subject.complete();
      }
    }, 800);

    setTimeout(() => {
      clearInterval(interval);
      if (!subject.closed) {
        subject.complete();
      }
    }, 300000);
  }

  cancelExtraction(): void {
    // Implement if you add cancel endpoint
  }
}
