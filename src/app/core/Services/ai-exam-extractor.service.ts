import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { QuestionType } from '../enums/question-type';
import { ApiResponse } from '../Models/ApiResponse';
export interface ExtractedChoiceDto {
    text: string;
    isCorrect: boolean;
}

export interface ExtractedQuestionDto {
    text: string;
    type: QuestionType;
    degree: number;
    choices?: ExtractedChoiceDto[];
    modelAnswer?: string;
    isCorrect?: boolean;
}

export interface ExtractionUpdate {
    state: string;
    progress: number;
    phase: string;
    error?: string;
    currentQuestion?: ExtractedQuestionDto | null;
    completedQuestions: ExtractedQuestionDto[];
}

@Injectable({
    providedIn: 'root',
})
export class AiExamExtractorService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = '/api/v1/teacher/quizzes/extract';

    async extractQuestionsFromPdf(file: File): Promise<Observable<ExtractionUpdate>> {
        const updateSubject = new Subject<ExtractionUpdate>();

        const formData = new FormData();
        formData.append('file', file);

        try {
            const uploadResponse = await this.http
                .post<ApiResponse<{ jobId: string; fileName: string }>>(
                    `${this.apiUrl}/upload`,
                    formData
                )
                .toPromise();

            if (!uploadResponse?.succeeded || !uploadResponse.data?.jobId) {
                updateSubject.next({
                    state: 'error',
                    progress: 0,
                    phase: 'فشل رفع الملف',
                    error: uploadResponse?.message || 'Upload failed',
                    completedQuestions: [],
                });
                updateSubject.complete();
                return updateSubject.asObservable();
            }

            const jobId = uploadResponse.data.jobId;
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

    private pollExtractionStatus(
        jobId: string,
        subject: Subject<ExtractionUpdate>
    ): void {
        const interval = setInterval(async () => {
            try {
                const response = await this.http
                    .get<ApiResponse<ExtractionUpdate>>(
                        `${this.apiUrl}/status/${jobId}`
                    )
                    .toPromise();

                if (!response?.succeeded || !response.data) {
                    return;
                }

                const data = response.data;
                subject.next(data);

                if (
                    data.state === 'completed' ||
                    data.state === 'failed' ||
                    data.state === 'cancelled'
                ) {
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


