import { HttpRequest, HttpResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';

import { AccessTokenService } from '@core/auth/access-token.service';
import { DEFAULT_APP_CONFIG } from '@core/config/app-config';
import { AppConfig } from '@core/config/app-config.model';
import { RuntimeConfigService } from '@core/config/runtime-config.service';
import { authInterceptor } from '@core/http/interceptors/auth.interceptor';

describe('authInterceptor', () => {
  let accessToken: AccessTokenService;
  let config: ReturnType<typeof signal<AppConfig>>;

  beforeEach(() => {
    config = signal({ ...DEFAULT_APP_CONFIG });
    TestBed.configureTestingModule({
      providers: [
        {
          provide: RuntimeConfigService,
          useValue: { config: config.asReadonly() },
        },
      ],
    });
    accessToken = TestBed.inject(AccessTokenService);
  });

  it('sends cookies to a trusted API when cookie transport is selected', () => {
    const intercepted = intercept('https://api.example.internal/projects');

    expect(intercepted.withCredentials).toBe(true);
    expect(intercepted.headers.has('Authorization')).toBe(false);
  });

  it('sends the in-memory bearer token to a trusted API without credentials', () => {
    config.set({ ...config(), authTransport: 'bearer' });
    accessToken.set(' access-token ');

    const intercepted = intercept('https://api.example.internal/projects');

    expect(intercepted.headers.get('Authorization')).toBe('Bearer access-token');
    expect(intercepted.credentials).toBe('omit');
  });

  it('does not send either authentication mechanism to an external origin', () => {
    config.set({ ...config(), authTransport: 'bearer' });
    accessToken.set('access-token');

    const intercepted = intercept('https://api.github.com/events');

    expect(intercepted.headers.has('Authorization')).toBe(false);
    expect(intercepted.withCredentials).toBe(false);
  });

  function intercept(url: string): HttpRequest<unknown> {
    let interceptedRequest: HttpRequest<unknown> | undefined;
    const request = new HttpRequest('GET', url);

    TestBed.runInInjectionContext(() =>
      authInterceptor(request, (nextRequest) => {
        interceptedRequest = nextRequest;
        return of(new HttpResponse({ status: 200 }));
      }).subscribe(),
    );

    if (!interceptedRequest) {
      throw new Error('The request was not passed to the next interceptor.');
    }

    return interceptedRequest;
  }
});
