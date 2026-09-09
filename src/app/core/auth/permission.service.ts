import { computed, inject, Injectable } from '@angular/core';

import { AuthSessionService } from '@core/auth/auth-session.service';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly authSession = inject(AuthSessionService);

  readonly roles = computed(() => this.authSession.currentUser()?.roles ?? []);

  hasRole(role: string): boolean {
    return this.roles().includes(role);
  }

  hasAnyRole(roles: readonly string[]): boolean {
    return roles.some((role) => this.hasRole(role));
  }
}
