// Models/Teacher/teacher-codes.module.ts

export interface AcademicYear {
    id: number;
    name: string; // e.g. 'الأول الثانوي'
}

export interface Lesson {
    id: number;
    name: string;
    academicYearId: number;
}

export interface CodeItem {
    id: number;
    code: string;
    status: 'used' | 'available';
    usedBy: string;   // empty string when available
    usedAt: string;   // empty string when available
}

export interface CodeBatch {
    id: number;
    academicYearId: number;
    academicYear: string;  // display name from backend join
    lessonId: number;
    lesson: string;        // display name from backend join
    createdAt: string;
    totalCodes: number;
    usedCodes: number;
    codes: CodeItem[];
}

// ── Request DTOs ──────────────────────────────────────────────────────────────

export interface CreateBatchRequest {
    academicYearId: number;
    lessonId: number;
    count: number;
    prefix?: string;   // optional 3-6 char prefix
}

// ── Response DTOs ─────────────────────────────────────────────────────────────

export interface CreateBatchResponse {
    codes: string[];
    // backend may also return the new batchId — add if your API does:
    // batchId?: number;
}