import { HttpErrorResponse } from '@angular/common/http';

import { AppError } from '@core/error-handling/app-error';

export function normalizeHttpError(error: unknown, correlationId?: string): AppError {
  if (error instanceof HttpErrorResponse) {
    return {
      code: error.status === 0 ? 'network.unavailable' : `http.${error.status}`,
      message: userSafeHttpMessage(error),
      status: error.status,
      correlationId,
    };
  }

  return {
    code: 'app.unexpected',
    message: 'Something went wrong. Please try again.',
    correlationId,
  };
}

function userSafeHttpMessage(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'The network request could not be completed.';
  }

  if (error.status === 401) {
    return 'Your session has expired. Please sign in again.';
  }

  if (error.status === 403) {
    return 'You do not have access to this action.';
  }

  if (error.status >= 500) {
    return 'The server could not complete the request.';
  }

  return 'The request could not be completed.';
}
