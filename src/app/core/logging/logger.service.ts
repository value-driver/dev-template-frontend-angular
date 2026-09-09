import { Injectable, isDevMode } from '@angular/core';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class Logger {
  debug(message: string, context?: Record<string, unknown>): void {
    if (!environment.production || isDevMode()) {
      console.log('[debug]', message, context ?? {});
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    if (!environment.production || isDevMode()) {
      console.log('[info]', message, context ?? {});
    }
  }

  warn(message: string, context?: Record<string, unknown>): void {
    console.warn('[warn]', message, context ?? {});
  }

  error(message: string, context?: Record<string, unknown>): void {
    console.error('[error]', message, context ?? {});
  }
}
