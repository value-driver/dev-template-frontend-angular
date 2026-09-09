import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { isTrustedInternalRequest } from '@core/http/interceptors/http-origin';
import { RuntimeConfigService } from '@core/config/runtime-config.service';

export const CORRELATION_ID_HEADER = 'X-Correlation-ID';

export const correlationIdInterceptor: HttpInterceptorFn = (request, next) => {
  const trustedOrigins = inject(RuntimeConfigService).config().trustedInternalOrigins;

  if (!isTrustedInternalRequest(request.url, trustedOrigins)) {
    return next(request);
  }

  const correlationId = request.headers.get(CORRELATION_ID_HEADER) ?? createCorrelationId();

  return next(
    request.clone({
      setHeaders: {
        [CORRELATION_ID_HEADER]: correlationId,
      },
    }),
  );
};

function createCorrelationId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `client-${Date.now()}-${Math.random().toString(16).slice(2)}`
  );
}
