import { InjectionToken } from '@angular/core';

export const SECURE_STORAGE_NAMESPACE = new InjectionToken<string>('SECURE_STORAGE_NAMESPACE', {
  providedIn: 'root',
  factory: () => 'frontend-starter',
});
