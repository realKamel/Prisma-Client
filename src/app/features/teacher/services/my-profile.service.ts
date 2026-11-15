import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ChangePasswordRequest,
  MyProfile,
  PictureUploadLink,
  PictureUploadRequest,
  UpdateMyProfileRequest,
} from '../models/my-profile.model';

/**
 * Teacher-side profile API.
 * The picture goes straight to object storage: ask for an upload URL, then PUT the file to it.
 * Once the PUT succeeds the picture is live; there is no confirm or scan step.
 */
@Service()
export class MyProfileService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/teachers/me/profile`;

  getProfile(): Observable<MyProfile> {
    return this.http.get<MyProfile>(this.base);
  }

  updateProfile(body: UpdateMyProfileRequest): Observable<void> {
    return this.http.put<void>(this.base, body);
  }

  requestPictureUpload(body: PictureUploadRequest): Observable<PictureUploadLink> {
    return this.http.post<PictureUploadLink>(`${this.base}/picture/upload-url`, body);
  }

  changePassword(body: ChangePasswordRequest): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/change-password`, body);
  }
}