/** DTO for a teacher's lesson returned from the API */
export interface TeacherLessonDto {
  id: number;
  name: string;
  price: number;
  students: number;
  status: 'drafted' | 'active' | 'hidden';
}

/** DTO for a lesson material/file returned from the API */
export interface LessonMaterialDto {
  id: number;
  title: string;
  size: string;
  type: string;
  downloadUrl: string;
}
