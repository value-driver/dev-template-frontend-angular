import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AccessTokenService {
  private readonly accessTokenState = signal<string | null>(null);

  readonly accessToken = this.accessTokenState.asReadonly();

  set(accessToken: string): void {
    const normalizedToken = accessToken.trim();

    if (!normalizedToken) {
      throw new Error('An access token is required for bearer authentication.');
    }

    this.accessTokenState.set(normalizedToken);
  }

  clear(): void {
    this.accessTokenState.set(null);
  }
}
