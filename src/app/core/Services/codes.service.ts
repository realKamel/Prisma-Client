import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import type { AcademicYear, Lesson, CodeBatch } from '../Models/Teacher/teacher-codes.module';
import { environment } from '../../../environments/environment';

export interface ApiResult<T> {
  data: T;
  fromFallback: boolean;
}

@Service()
export class CodesService {
  private http = inject(HttpClient);

  private readonly BASE = `${environment.apiUrl}/codes`;

  // ── Academic Years ──
  getAcademicYears(): Observable<ApiResult<AcademicYear[]>> {
    return this.http
      .get<{ data: AcademicYear[]; succeeded: boolean }>(`${this.BASE}/academic-years`)
      .pipe(
        map((res) => ({ data: res.data, fromFallback: false })),
        catchError(() => of({ data: this.getMockAcademicYears(), fromFallback: true })),
      );
  }

  // ── Lessons (all, with academicYearId per entry) ──
  getLessons(): Observable<ApiResult<Lesson[]>> {
    return this.http.get<{ data: Lesson[]; succeeded: boolean }>(`${this.BASE}/lessons`).pipe(
      map((res) => ({ data: res.data, fromFallback: false })),
      catchError(() => of({ data: this.getMockLessons(), fromFallback: true })),
    );
  }

  // ── Code Batches ──
  getBatches(): Observable<ApiResult<CodeBatch[]>> {
    return this.http.get<{ data: CodeBatch[]; succeeded: boolean }>(`${this.BASE}/batches`).pipe(
      map((res) => ({ data: res.data, fromFallback: false })),
      catchError(() => of({ data: this.getMockBatches(), fromFallback: true })),
    );
  }

  getBatch(id: number): Observable<ApiResult<CodeBatch | null>> {
    return this.http
      .get<{ data: CodeBatch; succeeded: boolean }>(`${this.BASE}/batches/${id}`)
      .pipe(
        map((res) => ({ data: res.data, fromFallback: false })),
        catchError(() => {
          const mock = this.getMockBatches();
          const found = mock.find((b) => b.id === id) || null;
          return of({ data: found, fromFallback: true });
        }),
      );
  }

  // ── Create new batch ──
  createBatch(payload: {
    academicYearId: number;
    lessonId: number;
    count: number;
    prefix?: string;
  }): Observable<ApiResult<{ codes: string[] }>> {
    return this.http
      .post<{ data: { batchId: number; codes: string[] }; succeeded: boolean }>(
        `${this.BASE}/batches`,
        payload,
      )
      .pipe(
        map((res) => ({ data: { codes: res.data.codes }, fromFallback: false })),
        catchError(() => {
          const codes: string[] = [];
          for (let i = 0; i < payload.count; i++) {
            codes.push(this.generateCode(payload.prefix || ''));
          }
          return of({ data: { codes }, fromFallback: true });
        }),
      );
  }

  // ── Code Generator (fallback) ──
  private generateCode(prefix: string): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const p = prefix ? prefix.toUpperCase() + '-' : '';
    return p + code.slice(0, 4) + '-' + code.slice(4);
  }

  // ── Mock Data ──
  private getMockAcademicYears(): AcademicYear[] {
    return [
      { id: 1, name: 'الأول الثانوي' },
      { id: 2, name: 'الثاني الثانوي' },
      { id: 3, name: 'الثالث الثانوي' },
    ];
  }

  private getMockLessons(): Lesson[] {
    return [
      { id: 1, name: 'الكهرباء الساكنة', academicYearId: 1 },
      { id: 2, name: 'قوانين نيوتن', academicYearId: 1 },
      { id: 3, name: 'الموجات الصوتية', academicYearId: 1 },
      { id: 4, name: 'المغناطيسية', academicYearId: 2 },
      { id: 5, name: 'الضوء والعدسات', academicYearId: 2 },
      { id: 6, name: 'الحركة الدورانية', academicYearId: 3 },
      { id: 7, name: 'الديناميكا الحرارية', academicYearId: 3 },
    ];
  }

  private getMockBatches(): CodeBatch[] {
    return [
      {
        id: 1,
        academicYearId: 1,
        academicYear: 'الأول الثانوي',
        lessonId: 1,
        lesson: 'الكهرباء الساكنة',
        createdAt: '٢٠٢٦/٠٦/٢٥',
        totalCodes: 20,
        usedCodes: 12,
        codes: [
          {
            id: 1,
            code: 'STAT-7X9K-2M4P',
            status: 'used',
            usedBy: 'محمد أحمد سالم',
            usedAt: '٢٠٢٦/٠٦/٢٦',
          },
          {
            id: 2,
            code: 'STAT-3N8B-5V1Q',
            status: 'used',
            usedBy: 'نورا حسن علي',
            usedAt: '٢٠٢٦/٠٦/٢٦',
          },
          { id: 3, code: 'STAT-4H2J-9K6W', status: 'available', usedBy: '', usedAt: '' },
          {
            id: 4,
            code: 'STAT-1L5M-3R8T',
            status: 'used',
            usedBy: 'يوسف محمود كمال',
            usedAt: '٢٠٢٦/٠٦/٢٧',
          },
          { id: 5, code: 'STAT-9P4C-7X2Y', status: 'available', usedBy: '', usedAt: '' },
          {
            id: 6,
            code: 'STAT-6V3N-1B5K',
            status: 'used',
            usedBy: 'سارة خالد عبد الله',
            usedAt: '٢٠٢٦/٠٦/٢٧',
          },
          { id: 7, code: 'STAT-2W8H-4J9L', status: 'available', usedBy: '', usedAt: '' },
          {
            id: 8,
            code: 'STAT-5T1R-6M3P',
            status: 'used',
            usedBy: 'عمر أحمد فاروق',
            usedAt: '٢٠٢٦/٠٦/٢٨',
          },
        ],
      },
      {
        id: 4,
        academicYearId: 2,
        academicYear: 'الثاني الثانوي',
        lessonId: 4,
        lesson: 'المغناطيسية',
        createdAt: '٢٠٢٦/٠٦/٢٢',
        totalCodes: 12,
        usedCodes: 5,
        codes: [],
      },
      {
        id: 5,
        academicYearId: 3,
        academicYear: 'الثالث الثانوي',
        lessonId: 6,
        lesson: 'الحركة الدورانية',
        createdAt: '٢٠٢٦/٠٦/١٨',
        totalCodes: 8,
        usedCodes: 0,
        codes: [],
      },
    ];
  }
}
