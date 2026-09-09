import { InjectionToken, Provider } from '@angular/core';

import {
  API_BASE_URL,
  REQUEST_TIMEOUT_MS,
  TRUSTED_INTERNAL_ORIGINS,
} from '@core/http/tokens/http.tokens';
import { SECURE_STORAGE_NAMESPACE } from '@core/security/secure-storage/secure-storage.tokens';
import { AppConfig } from '@core/config/app-config.model';

export const DEFAULT_APP_CONFIG: AppConfig = {
  apiBaseUrl: 'https://api.example.internal',
  authTransport: 'cookie',
  externalActivityUrl: 'https://api.github.com/events',
  environmentName: 'development',
  requestTimeoutMs: 15000,
  secureStorageNamespace: 'frontend-starter',
  trustedInternalOrigins: ['https://api.example.internal'],
};

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG', {
  providedIn: 'root',
  factory: () => DEFAULT_APP_CONFIG,
});

export function provideAppConfig(config: AppConfig): Provider[] {
  return [
    { provide: APP_CONFIG, useValue: config },
    { provide: API_BASE_URL, useValue: config.apiBaseUrl },
    { provide: REQUEST_TIMEOUT_MS, useValue: config.requestTimeoutMs },
    { provide: TRUSTED_INTERNAL_ORIGINS, useValue: config.trustedInternalOrigins },
    { provide: SECURE_STORAGE_NAMESPACE, useValue: config.secureStorageNamespace },
  ];
}
