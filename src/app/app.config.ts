import {
  ApplicationConfig,
  inject,
  LOCALE_ID,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
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
import { ConfigService } from './core/Services/config';
import { errorInterceptorInterceptor } from './core/interceptors/error-interceptor-interceptor';
import { cookieAuthInterceptor } from './core/interceptors/cookie-auth-interceptor';
import { AuthService } from './core/Services/auth';
import { AccentService } from './core/Services/accent-service';
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
      withViewTransitions(),
    ),
    {
      provide: TitleStrategy,
      useClass: CustomTitleStrategy,
    },
    provideHttpClient(withInterceptors([errorInterceptorInterceptor, cookieAuthInterceptor])),
    provideAppInitializer(async () => {
      const configService = inject(ConfigService);
      const authService = inject(AuthService);
      const accentService = inject(AccentService);
      const translateService = inject(TranslateService);
      const initialLang = localStorage.getItem('lang') ?? 'ar';
      try {
        await firstValueFrom(translateService.use(initialLang));
      } catch (error) {
        console.error('Failed to load translation core system:', error);
      }

      // 2. Run your application services setup
      await Promise.all([
        configService.loadAsync().catch((error) => {
          console.error(translateService.instant('COMMON.ERRORS.CONFIG_LOAD_FAILED'), error);
          return null;
        }),
        authService.loadUserInfoAsync().catch((err) => {
          console.error(translateService.instant('COMMON.ERRORS.AUTH_CHECK_FAILED'), err);
          return null;
        }),
        firstValueFrom(accentService.loadFromServer()).catch((err) => {
          console.error(translateService.instant('COMMON.ERRORS.ACCENT_LOAD_FAILED'), err);
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
      useValue: 'ar',
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
  ],
};
