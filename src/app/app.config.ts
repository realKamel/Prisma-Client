import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {
  provideRouter,
  Router,
  withComponentInputBinding,
  withInMemoryScrolling,
} from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { ConfigService } from './core/Services/config';
import { firstValueFrom } from 'rxjs';
import { errorInterceptorInterceptor } from './core/interceptors/error-interceptor-interceptor';
import { cookieAuthInterceptor } from './core/interceptors/cookie-auth-interceptor';
import { AuthService } from './core/Services/auth';
import { AuthStore } from './core/stores/user-store/user-store';
import { toast } from 'ngx-sonner';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled',
      }),
      withComponentInputBinding(),
    ),
    provideHttpClient(withInterceptors([errorInterceptorInterceptor, cookieAuthInterceptor])),
    provideAppInitializer(async () => {
      const configService = inject(ConfigService);
      const authService = inject(AuthService);
      const router = inject(Router);
      authService.loadUserInfo().subscribe({
        next: () => {
          toast.success('Loaded Data');
          router.navigate(['']);
        },
        error: () => {
          toast.error('Error Happened While Loading Data');
        },
      });
      return firstValueFrom(configService.load()).catch((err) => {
        console.error('فشل تحميل إعدادات المنصة:', err);
      });
    }),
  ],
};
