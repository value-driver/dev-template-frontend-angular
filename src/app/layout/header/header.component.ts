import { Component, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideMenu, LucideShieldCheck } from '@lucide/angular';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { BreadcrumbComponent } from '@layout/breadcrumb/breadcrumb.component';
import { NotificationDrawerComponent } from '@layout/notification-drawer/notification-drawer.component';
import { UserMenuComponent } from '@layout/user-menu/user-menu.component';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    NzTagModule,
    NzButtonModule,
    LucideMenu,
    LucideShieldCheck,
    BreadcrumbComponent,
    NotificationDrawerComponent,
    UserMenuComponent,
  ],
  template: `
    <header class="sticky top-0 z-30 border-b border-[#D2D2D2] bg-white">
      <div
        class="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-3 py-2.5 sm:px-4 lg:px-6"
      >
        <div class="flex items-center gap-3 min-w-0">
          <button
            type="button"
            (click)="toggleMobileNav.emit()"
            class="flex h-9 w-9 items-center justify-center rounded-lg text-[#333333] hover:bg-[#EBF5FF] md:!hidden"
            aria-label="Toggle navigation drawer"
          >
            <svg lucideMenu class="h-5 w-5" aria-hidden="true"></svg>
          </button>

          <a routerLink="/" class="flex min-w-0 items-center gap-3 text-inherit no-underline">
            <div
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1350DF] text-white"
            >
              <svg lucideShieldCheck class="h-[18px] w-[18px]" aria-hidden="true"></svg>
            </div>
            <div class="flex min-w-0 items-center gap-2.5 whitespace-nowrap">
              <span class="text-[15px] font-semibold tracking-tight text-[#101828]"
                >ValueDriver</span
              >
              <span class="h-4 w-px bg-[#D2D2D2]" aria-hidden="true"></span>
              <span class="text-[13px] font-medium text-[#667085]">Starter</span>
            </div>
          </a>

          <div class="hidden border-l border-[#D2D2D2] pl-4 md:block">
            <app-breadcrumb />
          </div>
        </div>

        <div class="flex items-center gap-2 sm:gap-3">
          <app-notification-drawer />
          <div class="h-5 w-[1px] bg-[#D2D2D2]"></div>
          <app-user-menu />
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  readonly toggleMobileNav = output<void>();
}
