import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AccessTokenService } from '@core/auth/access-token.service';
import { RuntimeConfigService } from '@core/config/runtime-config.service';
import { isTrustedInternalRequest } from '@core/http/interceptors/http-origin';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const config = inject(RuntimeConfigService).config();

  if (!isTrustedInternalRequest(request.url, config.trustedInternalOrigins)) {
    return next(request);
  }

  if (config.authTransport === 'bearer') {
    const accessToken = inject(AccessTokenService).accessToken();

    return next(
      request.clone({
        credentials: 'omit',
        setHeaders: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      }),
    );
  }

  return next(
    request.clone({
      withCredentials: true,
    }),
  );
};
