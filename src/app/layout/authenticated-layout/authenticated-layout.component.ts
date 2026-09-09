import { afterNextRender, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';

import { PageTitleBreadcrumbService } from '@core/layout/page-title-breadcrumb.service';
import { BreadcrumbComponent } from '@layout/breadcrumb/breadcrumb.component';
import { FooterComponent } from '@layout/footer/footer.component';
import { HeaderComponent } from '@layout/header/header.component';
import { NavigationComponent } from '@layout/navigation/navigation.component';
import { NetworkStatusComponent } from '@layout/network-status/network-status.component';

@Component({
  selector: 'app-authenticated-layout',
  imports: [
    RouterOutlet,
    NzDrawerModule,
    HeaderComponent,
    NavigationComponent,
    NetworkStatusComponent,
    FooterComponent,
    BreadcrumbComponent,
  ],
  template: `
    <div class="min-h-screen flex flex-col bg-[#F9F9F9] text-[#101828]">
      <app-header (toggleMobileNav)="openMobileNav()" />
      <app-network-status />

      <div
        class="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-4 px-3 py-3 sm:px-4 md:grid-cols-[232px_minmax(0,1fr)] md:px-6 md:py-4"
      >
        <aside class="hidden md:block">
          <div class="sticky top-[4.5rem]">
            <app-navigation />
          </div>
        </aside>

        <main class="min-w-0 flex flex-col">
          <div class="mb-3 md:hidden">
            <app-breadcrumb />
          </div>

          <header class="mb-4">
            <h1 class="text-xl font-semibold tracking-tight text-[#101828]">
              {{ pageTitle() }}
            </h1>
            @if (pageSubtitle()) {
              <p class="mt-1 max-w-3xl text-xs text-[#787676]">{{ pageSubtitle() }}</p>
            }
          </header>

          <section class="flex-1">
            <router-outlet />
          </section>
        </main>
      </div>

      <app-footer />

      <nz-drawer
        [nzClosable]="true"
        [nzVisible]="drawerVisible()"
        nzPlacement="left"
        nzTitle="Menu"
        [nzWidth]="300"
        (nzOnClose)="closeMobileNav()"
        [nzContent]="mobileNavContent"
      >
        <ng-template #mobileNavContent>
          <div (click)="closeMobileNav()">
            <app-navigation />
          </div>
        </ng-template>
      </nz-drawer>
    </div>
  `,
})
export class AuthenticatedLayoutComponent {
  private readonly layoutService = inject(PageTitleBreadcrumbService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly pageTitle = this.layoutService.pageTitle;
  protected readonly pageSubtitle = this.layoutService.pageSubtitle;
  protected readonly mobileNavOpen = signal(false);
  protected readonly compactNavigationViewport = signal(
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(max-width: 767px)').matches
      : false,
  );
  protected readonly drawerVisible = computed(
    () => this.mobileNavOpen() && this.compactNavigationViewport(),
  );

  constructor() {
    afterNextRender(() => {
      if (typeof window.matchMedia !== 'function') {
        this.compactNavigationViewport.set(true);
        return;
      }

      const mediaQuery = window.matchMedia('(max-width: 767px)');
      const syncViewport = (): void => {
        this.compactNavigationViewport.set(mediaQuery.matches);

        if (!mediaQuery.matches) {
          this.mobileNavOpen.set(false);
        }
      };

      mediaQuery.addEventListener('change', syncViewport);
      this.destroyRef.onDestroy(() => mediaQuery.removeEventListener('change', syncViewport));
    });
  }

  openMobileNav(): void {
    if (!this.compactNavigationViewport()) {
      return;
    }

    this.mobileNavOpen.set(true);
  }

  closeMobileNav(): void {
    this.mobileNavOpen.set(false);
  }
}
