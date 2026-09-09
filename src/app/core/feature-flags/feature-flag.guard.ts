import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';

import { FeatureFlagService } from '@core/feature-flags/feature-flag.service';

export function requireFeature(flag: string, redirectTo = '/dashboard'): CanMatchFn {
  return () => inject(FeatureFlagService).isEnabled(flag) || inject(Router).parseUrl(redirectTo);
}
