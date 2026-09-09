import { computed, Injectable, signal } from '@angular/core';

import { AuthUser } from '@core/auth/auth.models';

@Injectable({ providedIn: 'root' })
export class GlobalState {
  private readonly currentUserState = signal<AuthUser | null>(null);
  private readonly sidebarCollapsedState = signal(false);
  private readonly unreadNotificationsState = signal(0);

  readonly currentUser = this.currentUserState.asReadonly();
  readonly sidebarCollapsed = this.sidebarCollapsedState.asReadonly();
  readonly unreadNotifications = this.unreadNotificationsState.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserState() !== null);

  setCurrentUser(user: AuthUser | null): void {
    this.currentUserState.set(user);
  }

  setSidebarCollapsed(collapsed: boolean): void {
    this.sidebarCollapsedState.set(collapsed);
  }

  setUnreadNotifications(count: number): void {
    this.unreadNotificationsState.set(Math.max(0, count));
  }
}
