import { inject, Injectable, InjectionToken } from '@angular/core';

export type FeatureFlags = Readonly<Record<string, boolean>>;

export const FEATURE_FLAGS = new InjectionToken<FeatureFlags>('FEATURE_FLAGS', {
  providedIn: 'root',
  factory: () => ({}),
});

@Injectable({ providedIn: 'root' })
export class FeatureFlagService {
  private readonly flags = inject(FEATURE_FLAGS);

  isEnabled(flag: string): boolean {
    return this.flags[flag] === true;
  }
}
