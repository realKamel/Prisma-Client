import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Lesson } from '../Models/lesson-model';
import {
  FileFilter,
  UploadedFile,
} from '../../features/teacher/upload-materials-component/Component/upload-page.types';
import { TeacherLessonDto, LessonMaterialDto } from '../Models/Teacher/lesson-materials.model';

@Service()
export class LessonMaterialsService {
  private readonly http = inject(HttpClient);

  /** GET /api/v1/Teachers/lessons */
  getMyLessons(): Observable<Lesson[]> {
    return this.http
      .get<TeacherLessonDto[]>(`${environment.apiUrl}/Teachers/lessons`)
      .pipe(map((res) => (res ?? []).map((l) => ({ id: l.id, title: l.name }) as Lesson)));
  }

  /** Maps to GetLessonMaterialQueryHandler */
  getMaterials(lessonId: number): Observable<UploadedFile[]> {
    return this.http
      .get<LessonMaterialDto[]>(`${environment.apiUrl}/Lessons/${lessonId}/materials`)
      .pipe(
        map((res) =>
          (res ?? []).map(
            (m) =>
              ({
                id: m.id,
                name: m.title,
                size: m.size,
                type: this.mapType(m.type),
                date: '',
                downloadUrl: m.downloadUrl,
              }) as UploadedFile,
          ),
        ),
      );
  }

  /** Maps to UploadLessonMaterialsCommandHandler */
  uploadMaterials(lessonId: number, files: File[]): Observable<void> {
    const formData = new FormData();
    files.forEach((file) => formData.append('Files', file, file.name));

    return this.http.post<void>(`${environment.apiUrl}/Lessons/${lessonId}/materials`, formData);
  }

  deleteMaterial(lessonId: number, fileId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/Lessons/${lessonId}/materials/${fileId}`);
  }

  private mapType(type: string): FileFilter {
    const lower = type.toLowerCase();
    if (lower === 'pdf') return 'pdf';
    if (lower === 'ppt') return 'ppt';
    if (lower === 'vid' || lower === 'video') return 'vid';
    return 'pdf';
  }
}
