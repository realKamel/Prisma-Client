/** DTO for a teacher's lesson returned from the API */
export interface TeacherLessonDto {
  id: number;
  name: string;
  price: number;
  money: MoneyDto;
  students: number;
  status: 'drafted' | 'active' | 'hidden';
}

export interface MoneyDto {
  amount: number;
  currency: string;
  formatted: string;
}

/** DTO for a lesson material/file returned from the API */
export interface LessonMaterialDto {
  id: number;
  title: string;
  size: string;
  type: string;
  downloadUrl: string;
}
