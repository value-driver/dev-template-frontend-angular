import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

import { ApplicationError } from '@core/error-handling/app-error';
import { normalizeHttpError } from '@core/error-handling/error-normalizer';
import { CORRELATION_ID_HEADER } from '@core/http/interceptors/correlation-id.interceptor';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const correlationId = request.headers.get(CORRELATION_ID_HEADER) ?? undefined;

  return next(request).pipe(
    catchError((error: unknown) =>
      throwError(() => new ApplicationError(normalizeHttpError(error, correlationId))),
    ),
  );
};
