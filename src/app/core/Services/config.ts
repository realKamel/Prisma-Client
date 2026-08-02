import { inject, Service, signal } from '@angular/core';
import { PlatformConfig } from '../Models/platform-config';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, firstValueFrom, tap, throwError, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';
import { toast } from 'ngx-sonner';
import { IProblemDetails } from '../Models/problemDetails';

@Service()
export class ConfigService {
  private http = inject(HttpClient);

  readonly config = signal<PlatformConfig | null>(null);
  readonly errorMessage = signal<string | null>(null);

  async loadAsync() {
    return firstValueFrom(
      this.http
        .get<PlatformConfig>(`${environment.apiUrl}/LandingPage/export/${environment.teacherEmail}`)
        .pipe(
          timeout(10_000),
          tap((data) => {
            this.config.set(data);
            this.errorMessage.set(null); // Clear any old errors on success
          }),
          catchError((err: HttpErrorResponse) => {
            // All HTTP errors (4xx, 5xx, timeouts) land here!
            const problem = err.error as IProblemDetails | undefined;
            const userFriendlyMsg =
              problem?.detail || problem?.title || 'حدث خطأ، يرجى المحاولة لاحقاً';

            toast.error(userFriendlyMsg);
            this.errorMessage.set(userFriendlyMsg);

            return throwError(() => err);
          }),
        ),
    );
  }
}
