import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { ConfigService } from './core/Services/config';
import { firstValueFrom } from 'rxjs';
import { errorInterceptorInterceptor } from './core/interceptors/error-interceptor-interceptor';
import { cookieAuthInterceptor } from './core/interceptors/cookie-auth-interceptor';

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
    provideAppInitializer(() => {
      const configService = inject(ConfigService);
      return firstValueFrom(configService.load()).catch((err) => {
        console.error('فشل تحميل إعدادات المنصة:', err);
      });
    }),
  ],
};
