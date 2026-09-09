import { inject, Injectable, signal } from '@angular/core';

import { APP_CONFIG } from '@core/config/app-config';
import { AppConfig } from '@core/config/app-config.model';

@Injectable({ providedIn: 'root' })
export class RuntimeConfigService {
  private readonly fallback = inject(APP_CONFIG);
  private readonly currentConfig = signal<AppConfig>(this.fallback);

  readonly config = this.currentConfig.asReadonly();

  async load(): Promise<void> {
    const response = await fetch('/app-config.json', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Runtime configuration could not be loaded (${response.status}).`);
    }

    this.currentConfig.set(validateConfig(await response.json()));
  }
}

function validateConfig(value: unknown): AppConfig {
  if (!isRecord(value)) {
    throw new Error('Runtime configuration must be an object.');
  }

  const {
    apiBaseUrl,
    authTransport,
    externalActivityUrl,
    environmentName,
    requestTimeoutMs,
    secureStorageNamespace,
    trustedInternalOrigins,
  } = value;
  const validEnvironment = ['local', 'development', 'staging', 'production'].includes(
    String(environmentName),
  );

  if (
    !isHttpUrl(apiBaseUrl) ||
    !isAuthTransport(authTransport) ||
    !isHttpUrl(externalActivityUrl) ||
    !validEnvironment ||
    typeof requestTimeoutMs !== 'number' ||
    !Number.isInteger(requestTimeoutMs) ||
    requestTimeoutMs < 1000 ||
    requestTimeoutMs > 120000 ||
    typeof secureStorageNamespace !== 'string' ||
    !/^[a-z0-9-]{3,64}$/i.test(secureStorageNamespace) ||
    !Array.isArray(trustedInternalOrigins) ||
    !trustedInternalOrigins.every(isHttpUrl)
  ) {
    throw new Error('Runtime configuration is invalid.');
  }

  const apiOrigin = new URL(apiBaseUrl).origin;
  if (!trustedInternalOrigins.includes(apiOrigin)) {
    throw new Error('trustedInternalOrigins must include the API origin.');
  }

  return {
    apiBaseUrl,
    authTransport,
    externalActivityUrl,
    environmentName: environmentName as AppConfig['environmentName'],
    requestTimeoutMs,
    secureStorageNamespace,
    trustedInternalOrigins,
  };
}

function isAuthTransport(value: unknown): value is AppConfig['authTransport'] {
  return value === 'cookie' || value === 'bearer';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isHttpUrl(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }

  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}
