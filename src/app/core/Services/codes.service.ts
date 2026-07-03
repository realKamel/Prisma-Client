// services/codes.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import type {
    AcademicYear,
    Lesson,
    CodeBatch,
    CreateBatchRequest,
    CreateBatchResponse,
} from '../Models/Teacher/teacher-codes.module';

export interface ApiResult<T> {
    data: T;
    fromFallback: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class CodesService {
    private http = inject(HttpClient);

    // ── All endpoints under the same base ────────────────────────────────────
    private readonly BASE               = '/api/v1/Codes';
    private readonly ACADEMIC_YEARS_URL = `${this.BASE}/academic-years`;
    private readonly LESSONS_URL        = `${this.BASE}/lessons`;
    private readonly CODE_BATCHES_URL   = `${this.BASE}/batches`;

    // ── Envelope unwrapper ────────────────────────────────────────────────────
    private unwrap<T>(response: any): T[] {
        if (Array.isArray(response)) return response;
        if (response?.data && Array.isArray(response.data)) return response.data;
        if (response?.data?.items && Array.isArray(response.data.items)) return response.data.items;
        console.warn('[CodesService] Unexpected response shape:', response);
        return [];
    }

    // ── Academic Years ────────────────────────────────────────────────────────

    getAcademicYears(): Observable<ApiResult<AcademicYear[]>> {
        return this.http.get<any>(this.ACADEMIC_YEARS_URL, { params: { pageSize: '1000' } }).pipe(
            map(res => ({ data: this.unwrap<AcademicYear>(res), fromFallback: false })),
            catchError(() => of({ data: this.getMockAcademicYears(), fromFallback: true }))
        );
    }

    // ── Lessons ───────────────────────────────────────────────────────────────

    getLessons(): Observable<ApiResult<Lesson[]>> {
        return this.http.get<any>(this.LESSONS_URL, { params: { pageSize: '1000' } }).pipe(
            map(res => ({ data: this.unwrap<Lesson>(res), fromFallback: false })),
            catchError(() => of({ data: this.getMockLessons(), fromFallback: true }))
        );
    }

    /**
     * Client-side filter by academicYearId.
     */
    getLessonsByYear(academicYearId: number): Observable<ApiResult<Lesson[]>> {
        return this.getLessons().pipe(
            map(result => ({
                ...result,
                data: result.data.filter(l => l.academicYearId === academicYearId),
            }))
        );
    }

    // ── Code Batches ──────────────────────────────────────────────────────────

    getBatches(): Observable<ApiResult<CodeBatch[]>> {
        return this.http.get<any>(this.CODE_BATCHES_URL, { params: { pageSize: '1000' } }).pipe(
            map(res => ({ data: this.unwrap<CodeBatch>(res), fromFallback: false })),
            catchError(() => of({ data: this.getMockBatches(), fromFallback: true }))
        );
    }

    getBatch(id: number): Observable<ApiResult<CodeBatch | null>> {
        return this.http.get<any>(`${this.CODE_BATCHES_URL}/${id}`).pipe(
            map(res => {
                const batch: CodeBatch = res?.data ?? res;
                return { data: batch as CodeBatch, fromFallback: false };
            }),
            catchError(() => {
                const found = this.getMockBatches().find(b => b.id === id) ?? null;
                return of({ data: found, fromFallback: true });
            })
        );
    }

    // ── Create Batch ──────────────────────────────────────────────────────────

    createBatch(payload: CreateBatchRequest): Observable<ApiResult<CreateBatchResponse>> {
        return this.http.post<CreateBatchResponse>(this.CODE_BATCHES_URL, payload).pipe(
            map(data => ({ data, fromFallback: false })),
            catchError(() => {
                const codes = Array.from({ length: payload.count }, () =>
                    this.generateCode(payload.prefix ?? '')
                );
                return of({ data: { codes }, fromFallback: true }).pipe(delay(600));
            })
        );
    }

    // ── Local Code Generator (offline fallback only) ──────────────────────────

    private generateCode(prefix: string): string {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let raw = '';
        for (let i = 0; i < 8; i++) raw += chars.charAt(Math.floor(Math.random() * chars.length));
        const p = prefix ? prefix.toUpperCase() + '-' : '';
        return p + raw.slice(0, 4) + '-' + raw.slice(4);
    }

    // ── Mock Data (only shown when backend is unreachable) ────────────────────

    private getMockAcademicYears(): AcademicYear[] {
        return [
            { id: 1, name: 'الأول الثانوي' },
            { id: 2, name: 'الثاني الثانوي' },
            { id: 3, name: 'الثالث الثانوي' },
        ];
    }

    private getMockLessons(): Lesson[] {
        return [
            { id: 1, name: 'الكهرباء الساكنة',   academicYearId: 1 },
            { id: 2, name: 'قوانين نيوتن',        academicYearId: 1 },
            { id: 3, name: 'الموجات الصوتية',     academicYearId: 1 },
            { id: 4, name: 'المغناطيسية',         academicYearId: 2 },
            { id: 5, name: 'الضوء والعدسات',      academicYearId: 2 },
            { id: 6, name: 'الحركة الدورانية',    academicYearId: 3 },
            { id: 7, name: 'الديناميكا الحرارية', academicYearId: 3 },
        ];
    }

    private getMockBatches(): CodeBatch[] {
        return [
            {
                id: 1, academicYearId: 1, academicYear: 'الأول الثانوي',
                lessonId: 1, lesson: 'الكهرباء الساكنة', createdAt: '٢٠٢٦/٠٦/٢٥',
                totalCodes: 20, usedCodes: 12,
                codes: [
                    { id: 1,  code: 'STAT-7X9K-2M4P', status: 'used',      usedBy: 'محمد أحمد سالم',     usedAt: '٢٠٢٦/٠٦/٢٦' },
                    { id: 2,  code: 'STAT-3N8B-5V1Q', status: 'used',      usedBy: 'نورا حسن علي',       usedAt: '٢٠٢٦/٠٦/٢٦' },
                    { id: 3,  code: 'STAT-4H2J-9K6W', status: 'available', usedBy: '',                    usedAt: '' },
                    { id: 4,  code: 'STAT-1L5M-3R8T', status: 'used',      usedBy: 'يوسف محمود كمال',    usedAt: '٢٠٢٦/٠٦/٢٧' },
                    { id: 5,  code: 'STAT-9P4C-7X2Y', status: 'available', usedBy: '',                    usedAt: '' },
                    { id: 6,  code: 'STAT-6V3N-1B5K', status: 'used',      usedBy: 'سارة خالد عبد الله', usedAt: '٢٠٢٦/٠٦/٢٧' },
                    { id: 7,  code: 'STAT-2W8H-4J9L', status: 'available', usedBy: '',                    usedAt: '' },
                    { id: 8,  code: 'STAT-5T1R-6M3P', status: 'used',      usedBy: 'عمر أحمد فاروق',     usedAt: '٢٠٢٦/٠٦/٢٨' },
                    { id: 9,  code: 'STAT-8K7Q-2V4B', status: 'available', usedBy: '',                    usedAt: '' },
                    { id: 10, code: 'STAT-3Y6W-9N1C', status: 'used',      usedBy: 'منى سامي طاهر',      usedAt: '٢٠٢٦/٠٦/٢٨' },
                    { id: 11, code: 'STAT-1B4P-8H2J', status: 'available', usedBy: '',                    usedAt: '' },
                    { id: 12, code: 'STAT-7M9L-3R5T', status: 'used',      usedBy: 'علي حسين عمر',       usedAt: '٢٠٢٦/٠٦/٢٩' },
                    { id: 13, code: 'STAT-4X2K-6V8N', status: 'available', usedBy: '',                    usedAt: '' },
                    { id: 14, code: 'STAT-9C1B-5W3H', status: 'used',      usedBy: 'دينا وليد سامي',     usedAt: '٢٠٢٦/٠٦/٢٩' },
                    { id: 15, code: 'STAT-2J4R-7M9P', status: 'available', usedBy: '',                    usedAt: '' },
                    { id: 16, code: 'STAT-6L8T-1K3Q', status: 'used',      usedBy: 'كريم طارق عبيد',     usedAt: '٢٠٢٦/٠٦/٢٩' },
                    { id: 17, code: 'STAT-5N2V-4B6W', status: 'available', usedBy: '',                    usedAt: '' },
                    { id: 18, code: 'STAT-3H9C-8P1R', status: 'used',      usedBy: 'هنا أيمن مصطفى',     usedAt: '٢٠٢٦/٠٦/٢٩' },
                    { id: 19, code: 'STAT-7W5M-2L4K', status: 'available', usedBy: '',                    usedAt: '' },
                    { id: 20, code: 'STAT-1R3B-9T7N', status: 'available', usedBy: '',                    usedAt: '' },
                ],
            },
            {
                id: 2, academicYearId: 1, academicYear: 'الأول الثانوي',
                lessonId: 2, lesson: 'قوانين نيوتن', createdAt: '٢٠٢٦/٠٦/٢٨',
                totalCodes: 15, usedCodes: 3,
                codes: [
                    { id: 21, code: 'NEWN-8X2P-5M7K', status: 'used',      usedBy: 'محمد أحمد سالم',  usedAt: '٢٠٢٦/٠٦/٢٩' },
                    { id: 22, code: 'NEWN-3B9V-1H4R', status: 'available', usedBy: '', usedAt: '' },
                    { id: 23, code: 'NEWN-6L2W-8T5N', status: 'available', usedBy: '', usedAt: '' },
                    { id: 24, code: 'NEWN-9C4J-3K7Q', status: 'used',      usedBy: 'نورا حسن علي',    usedAt: '٢٠٢٦/٠٦/٢٩' },
                    { id: 25, code: 'NEWN-1M8H-6B2P', status: 'available', usedBy: '', usedAt: '' },
                    { id: 26, code: 'NEWN-5R3T-9W4L', status: 'available', usedBy: '', usedAt: '' },
                    { id: 27, code: 'NEWN-7K1N-2C8V', status: 'available', usedBy: '', usedAt: '' },
                    { id: 28, code: 'NEWN-4P6B-3M9X', status: 'used',      usedBy: 'يوسف محمود كمال', usedAt: '٢٠٢٦/٠٦/٢٩' },
                    { id: 29, code: 'NEWN-2H7W-5L1R', status: 'available', usedBy: '', usedAt: '' },
                    { id: 30, code: 'NEWN-8T4C-6K3J', status: 'available', usedBy: '', usedAt: '' },
                    { id: 31, code: 'NEWN-3N9P-1B7M', status: 'available', usedBy: '', usedAt: '' },
                    { id: 32, code: 'NEWN-6V2R-4H8T', status: 'available', usedBy: '', usedAt: '' },
                    { id: 33, code: 'NEWN-1X5K-9W3L', status: 'available', usedBy: '', usedAt: '' },
                    { id: 34, code: 'NEWN-4B8J-2M6C', status: 'available', usedBy: '', usedAt: '' },
                    { id: 35, code: 'NEWN-9L3H-7P1R', status: 'available', usedBy: '', usedAt: '' },
                ],
            },
            {
                id: 3, academicYearId: 1, academicYear: 'الأول الثانوي',
                lessonId: 3, lesson: 'الموجات الصوتية', createdAt: '٢٠٢٦/٠٦/٢٠',
                totalCodes: 10, usedCodes: 10,
                codes: [
                    { id: 36, code: 'WAVE-2M7K-4P9X', status: 'used', usedBy: 'محمد أحمد سالم',     usedAt: '٢٠٢٦/٠٦/٢١' },
                    { id: 37, code: 'WAVE-5B3V-8H1R', status: 'used', usedBy: 'نورا حسن علي',       usedAt: '٢٠٢٦/٠٦/٢١' },
                    { id: 38, code: 'WAVE-9L2W-6T4N', status: 'used', usedBy: 'يوسف محمود كمال',    usedAt: '٢٠٢٦/٠٦/٢٢' },
                    { id: 39, code: 'WAVE-3C9J-1K7Q', status: 'used', usedBy: 'سارة خالد عبد الله', usedAt: '٢٠٢٦/٠٦/٢٢' },
                    { id: 40, code: 'WAVE-7M8H-2B5P', status: 'used', usedBy: 'عمر أحمد فاروق',     usedAt: '٢٠٢٦/٠٦/٢٣' },
                    { id: 41, code: 'WAVE-1R4T-9W3L', status: 'used', usedBy: 'منى سامي طاهر',      usedAt: '٢٠٢٦/٠٦/٢٣' },
                    { id: 42, code: 'WAVE-6K2N-4C8V', status: 'used', usedBy: 'علي حسين عمر',       usedAt: '٢٠٢٦/٠٦/٢٤' },
                    { id: 43, code: 'WAVE-4P7B-3M9X', status: 'used', usedBy: 'دينا وليد سامي',     usedAt: '٢٠٢٦/٠٦/٢٤' },
                    { id: 44, code: 'WAVE-8H3W-5L1R', status: 'used', usedBy: 'كريم طارق عبيد',     usedAt: '٢٠٢٦/٠٦/٢٥' },
                    { id: 45, code: 'WAVE-2T6C-7K4J', status: 'used', usedBy: 'هنا أيمن مصطفى',     usedAt: '٢٠٢٦/٠٦/٢٥' },
                ],
            },
            {
                id: 4, academicYearId: 2, academicYear: 'الثاني الثانوي',
                lessonId: 4, lesson: 'المغناطيسية', createdAt: '٢٠٢٦/٠٦/٢٢',
                totalCodes: 12, usedCodes: 5,
                codes: [
                    { id: 46, code: 'MAGN-3K7P-9X2M', status: 'used',      usedBy: 'أحمد سعيد فتحي', usedAt: '٢٠٢٦/٠٦/٢٣' },
                    { id: 47, code: 'MAGN-5B1V-4H8R', status: 'available', usedBy: '', usedAt: '' },
                    { id: 48, code: 'MAGN-2W6N-7T3L', status: 'used',      usedBy: 'مريم عادل حسني', usedAt: '٢٠٢٦/٠٦/٢٣' },
                    { id: 49, code: 'MAGN-8C4J-1K9Q', status: 'available', usedBy: '', usedAt: '' },
                    { id: 50, code: 'MAGN-6M2H-3B7P', status: 'used',      usedBy: 'زياد كريم نبيل', usedAt: '٢٠٢٦/٠٦/٢٤' },
                    { id: 51, code: 'MAGN-1R8T-5W4L', status: 'available', usedBy: '', usedAt: '' },
                    { id: 52, code: 'MAGN-4K3N-9C6V', status: 'used',      usedBy: 'ياسمين طارق علي', usedAt: '٢٠٢٦/٠٦/٢٤' },
                    { id: 53, code: 'MAGN-7P5B-2M8X', status: 'available', usedBy: '', usedAt: '' },
                    { id: 54, code: 'MAGN-9H1W-6L3R', status: 'used',      usedBy: 'عمر فؤاد سامي',  usedAt: '٢٠٢٦/٠٦/٢٥' },
                    { id: 55, code: 'MAGN-3T7C-4K2J', status: 'available', usedBy: '', usedAt: '' },
                    { id: 56, code: 'MAGN-8N9P-1B5M', status: 'available', usedBy: '', usedAt: '' },
                    { id: 57, code: 'MAGN-2V6R-7H4T', status: 'available', usedBy: '', usedAt: '' },
                ],
            },
            {
                id: 5, academicYearId: 3, academicYear: 'الثالث الثانوي',
                lessonId: 6, lesson: 'الحركة الدورانية', createdAt: '٢٠٢٦/٠٦/١٨',
                totalCodes: 8, usedCodes: 0,
                codes: [
                    { id: 58, code: 'ROTA-5K9P-2X7M', status: 'available', usedBy: '', usedAt: '' },
                    { id: 59, code: 'ROTA-3B1V-8H4R', status: 'available', usedBy: '', usedAt: '' },
                    { id: 60, code: 'ROTA-7W2N-6T9L', status: 'available', usedBy: '', usedAt: '' },
                    { id: 61, code: 'ROTA-4C8J-3K1Q', status: 'available', usedBy: '', usedAt: '' },
                    { id: 62, code: 'ROTA-9M6H-2B5P', status: 'available', usedBy: '', usedAt: '' },
                    { id: 63, code: 'ROTA-1R4T-7W3L', status: 'available', usedBy: '', usedAt: '' },
                    { id: 64, code: 'ROTA-6K2N-5C8V', status: 'available', usedBy: '', usedAt: '' },
                    { id: 65, code: 'ROTA-8P3B-1M9X', status: 'available', usedBy: '', usedAt: '' },
                ],
            },
        ];
    }
}