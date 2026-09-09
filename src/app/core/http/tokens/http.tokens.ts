import { InjectionToken } from '@angular/core';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => 'https://api.example.internal',
});
export const TRUSTED_INTERNAL_ORIGINS = new InjectionToken<string[]>('TRUSTED_INTERNAL_ORIGINS', {
  providedIn: 'root',
  factory: () => ['https://api.example.internal'],
});
export const REQUEST_TIMEOUT_MS = new InjectionToken<number>('REQUEST_TIMEOUT_MS', {
  providedIn: 'root',
  factory: () => 15000,
});
