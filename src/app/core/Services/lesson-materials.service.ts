import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../Models/ApiResponse';
import { Lesson } from '../Models/lesson-model';
import {
  FileFilter,
  UploadedFile,
} from '../../features/teacher/upload-materials-component/Component/upload-page.types';

interface TeacherLessonDto {
  id: number;
  name: string;
  price: number;
  students: number;
  status: 'drafted' | 'active' | 'hidden';
}

interface LessonMaterialDto {
  id: number;
  title: string;
  size: string;
  type: string;
  downloadUrl: string;
}

@Service()
export class LessonMaterialsService {
  private readonly http = inject(HttpClient);

  /** GET /api/v1/Teachers/lessons */
  getMyLessons(): Observable<Lesson[]> {
    return this.http
      .get<ApiResponse<TeacherLessonDto[]>>(`${environment.apiUrl}/Teachers/lessons`)
      .pipe(map((res) => (res.data ?? []).map((l) => ({ id: l.id, title: l.name }) as Lesson)));
  }

  /** Maps to GetLessonMaterialQueryHandler */
  getMaterials(lessonId: number): Observable<UploadedFile[]> {
    return this.http
      .get<ApiResponse<LessonMaterialDto[]>>(`${environment.apiUrl}/Lessons/materials/${lessonId}`)
      .pipe(
        map((res) =>
          (res.data ?? []).map(
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
  uploadMaterials(lessonId: number, files: File[]): Observable<ApiResponse<string>> {
    const formData = new FormData();
    files.forEach((file) => formData.append('Files', file, file.name));

    return this.http.post<ApiResponse<string>>(
      `${environment.apiUrl}/Lessons/upload-materials/${lessonId}`,
      formData,
    );
  }

  deleteMaterial(lessonId: number, fileId: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(
      `${environment.apiUrl}/Lessons/delete-material/${lessonId}/${fileId}`,
    );
  }

  private mapType(type: string): FileFilter {
    const lower = type.toLowerCase();
    if (lower === 'pdf') return 'pdf';
    if (lower === 'ppt') return 'ppt';
    if (lower === 'vid' || lower === 'video') return 'vid';
    return 'pdf';
  }
}
