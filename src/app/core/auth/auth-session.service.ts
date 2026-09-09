import { inject, Injectable } from '@angular/core';

import { AccessTokenService } from '@core/auth/access-token.service';
import { AuthUser, DEMO_AUTH_USER } from '@core/auth/auth.models';
import { RuntimeConfigService } from '@core/config/runtime-config.service';
import { GlobalState } from '@core/state/global-state';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly globalState = inject(GlobalState);
  private readonly accessToken = inject(AccessTokenService);
  private readonly runtimeConfig = inject(RuntimeConfigService);

  readonly currentUser = this.globalState.currentUser;
  readonly isAuthenticated = this.globalState.isAuthenticated;

  signIn(user: AuthUser = DEMO_AUTH_USER): void {
    if (this.runtimeConfig.config().authTransport === 'bearer') {
      throw new Error('Use signInWithBearerToken when authTransport is bearer.');
    }

    this.accessToken.clear();
    this.globalState.setCurrentUser(user);
  }

  signInWithBearerToken(user: AuthUser, accessToken: string): void {
    if (this.runtimeConfig.config().authTransport !== 'bearer') {
      throw new Error('authTransport must be bearer to use an access token.');
    }

    this.accessToken.set(accessToken);
    this.globalState.setCurrentUser(user);
  }

  signOut(): void {
    this.accessToken.clear();
    this.globalState.setCurrentUser(null);
  }
}
