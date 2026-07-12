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
import { errorInterceptorInterceptor } from './core/interceptors/error-interceptor-interceptor';
import { cookieAuthInterceptor } from './core/interceptors/cookie-auth-interceptor';
import { AuthService } from './core/Services/auth';
import { AccentService } from './core/Services/accent-service';
import { firstValueFrom } from 'rxjs';

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
      const accentService = inject(AccentService);

      await Promise.all([
        configService.loadAsync().catch((error) => {
          console.error('فشل تحميل إعدادات المنصة:', error);
          return null;
        }),
        authService.loadUserInfoAsync().catch((err) => {
          console.error('Auth check failed:', err);
          return null; // guest mode
        }),
        firstValueFrom(accentService.loadFromServer()).catch((err) => {
          console.error('فشل تحميل إعدادات اللون:', err);
          return null;
        }),
      ]);

      return;
    }),
  ],
};
