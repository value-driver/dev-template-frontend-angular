import { ErrorHandler, inject, Injectable } from '@angular/core';

import { Logger } from '@core/logging/logger.service';

@Injectable()
export class AppErrorHandler implements ErrorHandler {
  private readonly logger = inject(Logger);

  handleError(error: unknown): void {
    const detail =
      error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : {};
    this.logger.error('Unhandled application error', detail);
    console.error(error);
  }
}
