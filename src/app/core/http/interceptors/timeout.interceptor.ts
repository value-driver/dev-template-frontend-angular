import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { timeout } from 'rxjs';

import { RuntimeConfigService } from '@core/config/runtime-config.service';

export const timeoutInterceptor: HttpInterceptorFn = (request, next) => {
  const timeoutMs = inject(RuntimeConfigService).config().requestTimeoutMs;

  return next(request).pipe(timeout(timeoutMs));
};
