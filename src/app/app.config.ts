import {
  provideHttpClient,
  withFetch,
  withInterceptors,
  withXsrfConfiguration,
} from '@angular/common/http';
import {
  ApplicationConfig,
  ErrorHandler,
  inject,
  provideAppInitializer,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { en_US, NZ_I18N } from 'ng-zorro-antd/i18n';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';

import { routes } from '@app/app.routes';
import { DEFAULT_APP_CONFIG, provideAppConfig } from '@core/config/app-config';
import { RuntimeConfigService } from '@core/config/runtime-config.service';
import { AppErrorHandler } from '@core/error-handling/app-error-handler';
import { authInterceptor } from '@core/http/interceptors/auth.interceptor';
import { correlationIdInterceptor } from '@core/http/interceptors/correlation-id.interceptor';
import { errorInterceptor } from '@core/http/interceptors/error.interceptor';
import { timeoutInterceptor } from '@core/http/interceptors/timeout.interceptor';
import { PageTitleBreadcrumbService } from '@core/layout/page-title-breadcrumb.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideAppConfig(DEFAULT_APP_CONFIG),
    { provide: ErrorHandler, useClass: AppErrorHandler },
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions({
        skipInitialTransition: true,
        onViewTransitionCreated: (transitionInfo) => {
          transitionInfo.transition.ready.catch(() => {});
          transitionInfo.transition.finished.catch(() => {});
        },
      }),
    ),
    provideAnimationsAsync(),
    provideHttpClient(
      withFetch(),
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN',
      }),
      withInterceptors([
        correlationIdInterceptor,
        authInterceptor,
        timeoutInterceptor,
        errorInterceptor,
      ]),
    ),
    { provide: NZ_I18N, useValue: en_US },
    NzMessageService,
    NzNotificationService,
    NzModalService,
    provideAppInitializer(async () => {
      const runtimeConfig = inject(RuntimeConfigService);
      const breadcrumb = inject(PageTitleBreadcrumbService);

      await runtimeConfig.load();
      breadcrumb.initialize();
    }),
  ],
};
