import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { PermissionService } from '@core/auth/permission.service';

export function requireAnyRole(roles: readonly string[], redirectTo = '/dashboard'): CanActivateFn {
  return () => {
    const permissions = inject(PermissionService);
    return permissions.hasAnyRole(roles) || inject(Router).parseUrl(redirectTo);
  };
}
