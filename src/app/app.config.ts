import {
  ApplicationConfig,
  inject,
  LOCALE_ID,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  isDevMode,
} from '@angular/core';
import {
  provideRouter,
  TitleStrategy,
  withComponentInputBinding,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { errorInterceptorInterceptor } from './core/interceptors/error-interceptor-interceptor';
import { cookieAuthInterceptor } from './core/interceptors/cookie-auth-interceptor';
import { firstValueFrom } from 'rxjs';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideIcons } from '@ng-icons/core';
import { lucideMessageCircleMore } from '@ng-icons/lucide';
import { CustomTitleStrategy } from './core/Services/custom-title-strategy';
import {
  bootstrapSendFill,
  bootstrapXCircleFill,
  bootstrapFileEarmarkCheckFill,
  bootstrapEyeFill,
  bootstrapEnvelopeFill,
  bootstrapPersonCheckFill,
  bootstrapSearch,
  bootstrapPeopleFill,
  bootstrapLayersFill,
  bootstrapJournalText,
  bootstrapPlusCircleFill,
  bootstrapPencilFill,
  bootstrapTrashFill,
  bootstrapActivity,
  bootstrapPcDisplay,
  bootstrapCalendarCheck,
  bootstrapLightningCharge,
  bootstrapPatchCheckFill,
  bootstrapStarFill,
} from '@ng-icons/bootstrap-icons';
import { provideServiceWorker } from '@angular/service-worker';
import { AuthStoreService } from './core/Services/auth-store.service';

const initialLang = typeof window !== 'undefined' ? (localStorage.getItem('lang') ?? 'ar') : 'ar';
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
      withViewTransitions({ skipInitialTransition: true }),
    ),
    {
      provide: TitleStrategy,
      useClass: CustomTitleStrategy,
    },
    provideHttpClient(withInterceptors([errorInterceptorInterceptor, cookieAuthInterceptor])),
    provideAppInitializer(async () => {
      // const configService = inject(ConfigService);
      const authService = inject(AuthStoreService);
      // const accentService = inject(AccentService);
      const translateService = inject(TranslateService);
      const initialLang = localStorage.getItem('lang') ?? 'ar';
      try {
        await firstValueFrom(translateService.use(initialLang));
      } catch (error) {
        console.error('Failed to load translation core system:', error);
      }
      await Promise.all([
        authService.loadUserInfo().catch((err) => {
          console.error(translateService.instant('COMMON.ERRORS.AUTH_CHECK_FAILED'), err);
          return null;
        }),
      ]);

      return;
    }),
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: 'i18n/',
        suffix: '.json',
      }),
      fallbackLang: 'en',
      lang: initialLang,
    }),
    {
      provide: LOCALE_ID,
      useFactory: () =>
        typeof window !== 'undefined' ? (localStorage.getItem('lang') ?? 'ar') : 'ar',
    },
    provideIcons({
      lucideMessageCircleMore,
      bootstrapSendFill,
      bootstrapXCircleFill,
      bootstrapFileEarmarkCheckFill,
      bootstrapEyeFill,
      bootstrapEnvelopeFill,
      bootstrapPersonCheckFill,
      bootstrapSearch,
      bootstrapPeopleFill,
      bootstrapLayersFill,
      bootstrapJournalText,
      bootstrapPlusCircleFill,
      bootstrapPencilFill,
      bootstrapTrashFill,
      bootstrapActivity,
      bootstrapPcDisplay,
      bootstrapPatchCheckFill,
      bootstrapCalendarCheck,
      bootstrapLightningCharge,
      bootstrapStarFill,
    }),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
