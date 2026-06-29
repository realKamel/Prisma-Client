export interface AcademicYear {
  id: number;
  name: string;
}

export interface Lesson {
  id: number;
  name: string;
  academicYearId: number;
}

export interface Code {
  id: number;
  code: string;
  status: 'used' | 'available';
  usedBy: string;
  usedAt: string;
}

export interface CodeBatch {
  id: number;
  academicYearId: number;
  academicYear: string;
  lessonId: number;
  lesson: string;
  createdAt: string;
  totalCodes: number;
  usedCodes: number;
  codes: Code[];
}
