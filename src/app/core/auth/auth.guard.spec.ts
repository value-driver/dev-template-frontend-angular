import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import { AuthSessionService } from '@core/auth/auth-session.service';
import { authGuard } from '@core/auth/auth.guard';

describe('authGuard', () => {
  let authSession: AuthSessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
    authSession = TestBed.inject(AuthSessionService);
    authSession.signOut();
  });

  it('allows navigation when a user is signed in', () => {
    authSession.signIn();

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/dashboard' } as never),
    );

    expect(result).toBe(true);
  });

  it('redirects unauthenticated users to login with a return URL', () => {
    const router = TestBed.inject(Router);
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/settings' } as never),
    );

    expect(result instanceof UrlTree).toBe(true);
    expect(router.serializeUrl(result as UrlTree)).toBe('/auth/login?returnUrl=%2Fsettings');
  });
});
