import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';

import { AuthSessionService } from '@core/auth/auth-session.service';

// Route guards improve UX only; the backend must authorize every request.
function requireAuthenticated(returnUrl: string) {
  const authSession = inject(AuthSessionService);
  const router = inject(Router);

  if (authSession.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/auth/login'], { queryParams: { returnUrl } });
}

export const authGuard: CanActivateFn = (_route, state) => requireAuthenticated(state.url);

export const authChildGuard: CanActivateChildFn = (_route, state) =>
  requireAuthenticated(state.url);
