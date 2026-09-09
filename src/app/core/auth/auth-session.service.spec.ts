import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { AccessTokenService } from '@core/auth/access-token.service';
import { DEMO_AUTH_USER } from '@core/auth/auth.models';
import { AuthSessionService } from '@core/auth/auth-session.service';
import { DEFAULT_APP_CONFIG } from '@core/config/app-config';
import { AppConfig } from '@core/config/app-config.model';
import { RuntimeConfigService } from '@core/config/runtime-config.service';

describe('AuthSessionService', () => {
  let accessToken: AccessTokenService;
  let authSession: AuthSessionService;
  let config: ReturnType<typeof signal<AppConfig>>;

  beforeEach(() => {
    config = signal({ ...DEFAULT_APP_CONFIG, authTransport: 'bearer' });
    TestBed.configureTestingModule({
      providers: [
        {
          provide: RuntimeConfigService,
          useValue: { config: config.asReadonly() },
        },
      ],
    });
    accessToken = TestBed.inject(AccessTokenService);
    authSession = TestBed.inject(AuthSessionService);
  });

  it('keeps a bearer token only for the active session and clears it on sign-out', () => {
    authSession.signInWithBearerToken(DEMO_AUTH_USER, 'access-token');

    expect(authSession.isAuthenticated()).toBe(true);
    expect(accessToken.accessToken()).toBe('access-token');

    authSession.signOut();

    expect(authSession.isAuthenticated()).toBe(false);
    expect(accessToken.accessToken()).toBeNull();
  });

  it('does not accept a bearer token when cookie transport is selected', () => {
    config.set({ ...config(), authTransport: 'cookie' });

    expect(() => authSession.signInWithBearerToken(DEMO_AUTH_USER, 'access-token')).toThrow(
      'authTransport must be bearer',
    );
  });
});
