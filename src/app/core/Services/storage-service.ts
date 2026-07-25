import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

interface CachedUrl {
  url: string;
  expiresAt: number;
}

@Service()
export class StorageService {
  private readonly http = inject(HttpClient);
  private cache = new Map<string, CachedUrl>();

  getDownloadUrl(
    objectKey: string,
    bucketName = 'prisma-bucket',
    expiryMinutes = 60,
  ): Observable<string> {
    const cached = this.cache.get(objectKey);

    if (cached && cached.expiresAt > Date.now() + 60_000) {
      return of(cached.url);
    }

    const params = new HttpParams()
      .set('bucketName', bucketName)
      .set('objectKey', objectKey)
      .set('expiryMinutes', expiryMinutes.toString());

    return this.http
      .get(`${environment.apiUrl}/Storage/download`, { params, responseType: 'text' })
      .pipe(
        tap((url) => {
          this.cache.set(objectKey, {
            url,
            expiresAt: Date.now() + expiryMinutes * 60_000,
          });
        }),
      );
  }
}
