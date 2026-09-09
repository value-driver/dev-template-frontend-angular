import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideLogOut, LucideSettings } from '@lucide/angular';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { DialogService } from '@core/feedback/dialog.service';
import { ToastService } from '@core/feedback/toast.service';
import { AuthSessionService } from '@core/auth/auth-session.service';

@Component({
  selector: 'app-user-menu',
  imports: [
    RouterLink,
    NzAvatarModule,
    NzButtonModule,
    NzDropDownModule,
    NzTagModule,
    LucideSettings,
    LucideLogOut,
  ],
  template: `
    <button
      nz-button
      nzType="text"
      nz-dropdown
      [nzDropdownMenu]="userDropdown"
      nzPlacement="bottomRight"
      class="flex h-10 items-center gap-2.5 rounded-lg px-2 text-left hover:bg-[#EBF5FF]"
      aria-label="Open user profile menu"
    >
      <nz-avatar
        nzSize="small"
        [nzText]="initials()"
        class="bg-[#1350DF] text-white font-semibold flex items-center justify-center text-xs"
      ></nz-avatar>
      <div class="hidden text-left md:block">
        <div class="text-xs font-semibold text-[#101828]">
          {{ displayName() }}
        </div>
        <div class="text-[10px] text-[#787676]">{{ email() }}</div>
      </div>
    </button>

    <nz-dropdown-menu #userDropdown="nzDropdownMenu">
      <div class="w-64 rounded-xl border border-[#D2D2D2] bg-white p-2">
        <div class="border-b border-[#D2D2D2] px-3 py-2.5">
          <div class="font-semibold text-[#101828]">{{ displayName() }}</div>
          <div class="text-xs text-[#787676]">{{ email() }}</div>
          <div class="mt-2 flex items-center gap-1.5">
            @for (role of roles(); track role) {
              <nz-tag nzColor="processing" class="m-0 text-[10px]">{{ role }}</nz-tag>
            }
            <nz-tag nzColor="success" class="m-0 text-[10px]">Verified Session</nz-tag>
          </div>
        </div>

        <ul nz-menu class="app-user-menu-list p-0 border-0">
          <li
            nz-menu-item
            routerLink="/settings"
            class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#101828] hover:bg-[#EBF5FF]"
          >
            <svg lucideSettings class="h-4 w-4 text-[#787676]" aria-hidden="true"></svg>
            <span class="leading-tight">Preferences & Security</span>
          </li>
          <li
            nz-menu-item
            (click)="triggerLogout()"
            class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <svg lucideLogOut class="h-4 w-4 text-red-600" aria-hidden="true"></svg>
            <span class="leading-tight">Sign Out</span>
          </li>
        </ul>
      </div>
    </nz-dropdown-menu>
  `,
})
export class UserMenuComponent {
  private readonly authSession = inject(AuthSessionService);
  private readonly dialog = inject(DialogService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly displayName = computed(
    () => this.authSession.currentUser()?.displayName ?? 'Signed Out',
  );
  protected readonly email = computed(() => this.authSession.currentUser()?.email ?? 'No session');
  protected readonly roles = computed(() => this.authSession.currentUser()?.roles ?? ['Guest']);
  protected readonly initials = computed(() =>
    this.displayName()
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join(''),
  );

  async triggerLogout(): Promise<void> {
    const confirmed = await this.dialog.confirm({
      title: 'Sign Out Confirmation',
      content: 'Are you sure you want to end your current authenticated session?',
      okText: 'Sign Out',
      cancelText: 'Stay Logged In',
      okDanger: true,
    });

    if (confirmed) {
      this.authSession.signOut();
      this.toast.info('You have been signed out successfully.');
      void this.router.navigate(['/auth/login']);
    }
  }
}
