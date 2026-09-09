import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideArrowRight, LucideLock, LucideMail } from '@lucide/angular';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';

import { ToastService } from '@core/feedback/toast.service';
import { AuthSessionService } from '@core/auth/auth-session.service';

@Component({
  selector: 'app-login-page',
  imports: [
    FormsModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCheckboxModule,
    NzAlertModule,
    LucideMail,
    LucideLock,
    LucideArrowRight,
  ],
  template: `
    <nz-card class="rounded-lg border border-[#D2D2D2] bg-white">
      <div class="mb-4 text-center">
        <h2 class="text-lg font-semibold text-[#101828]">Sign In</h2>
        <p class="mt-1 text-xs text-[#787676]">Use your workspace account.</p>
      </div>

      <form (ngSubmit)="onSubmit()" class="grid gap-3">
        <div>
          <label for="email" class="mb-1 block text-xs font-semibold text-[#333333]">
            Work Email
          </label>
          <nz-input-group [nzPrefix]="mailIcon">
            <input
              nz-input
              id="email"
              type="email"
              [(ngModel)]="email"
              name="email"
              placeholder="admin@enterprise.internal"
              required
              class="h-10 rounded-lg"
            />
          </nz-input-group>
          <ng-template #mailIcon>
            <svg lucideMail class="h-4 w-4 text-[#787676]" aria-hidden="true"></svg>
          </ng-template>
        </div>

        <div>
          <div class="mb-1 flex items-center justify-between">
            <label for="password" class="text-xs font-semibold text-[#333333]"> Password </label>
            <a href="javascript:void(0)" class="text-xs text-[#1350DF] hover:underline">
              Forgot password?
            </a>
          </div>
          <nz-input-group [nzPrefix]="lockIcon">
            <input
              nz-input
              id="password"
              type="password"
              [(ngModel)]="password"
              name="password"
              placeholder="••••••••••••"
              required
              class="h-10 rounded-lg"
            />
          </nz-input-group>
          <ng-template #lockIcon>
            <svg lucideLock class="h-4 w-4 text-[#787676]" aria-hidden="true"></svg>
          </ng-template>
        </div>

        <div class="flex items-center justify-between">
          <label
            nz-checkbox
            [(ngModel)]="rememberMe"
            name="rememberMe"
            class="text-xs text-[#787676]"
          >
            Remember on this device
          </label>
        </div>

        <button
          nz-button
          nzType="primary"
          nzBlock
          [nzLoading]="loading()"
          class="h-10 rounded-lg bg-[#1350DF] font-semibold hover:bg-[#111098] text-sm"
        >
          <span>Sign In</span>
          <svg lucideArrowRight class="h-4 w-4 ml-1" aria-hidden="true"></svg>
        </button>

        <div class="my-1 flex items-center gap-2">
          <div class="h-[1px] flex-1 bg-[#D2D2D2]"></div>
          <span class="text-[10px] uppercase tracking-wider text-[#787676]">or</span>
          <div class="h-[1px] flex-1 bg-[#D2D2D2]"></div>
        </div>

        <button
          type="button"
          nz-button
          nzBlock
          (click)="onDemoLogin()"
          class="h-10 rounded-lg border-[#D2D2D2] hover:border-[#1350DF] text-xs font-semibold"
        >
          Demo Admin
        </button>
      </form>
    </nz-card>
  `,
})
export class LoginPageComponent {
  private readonly authSession = inject(AuthSessionService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected email = 'admin@enterprise.internal';
  protected password = '••••••••••••';
  protected rememberMe = true;
  protected readonly loading = signal(false);

  onSubmit(): void {
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
      this.authSession.signIn();
      this.toast.success('Authenticated successfully. Redirecting to workspace.');
      void this.router.navigateByUrl(this.safeReturnUrl());
    }, 600);
  }

  onDemoLogin(): void {
    this.authSession.signIn();
    this.toast.success('Instant SSO verified. Welcome back, Enterprise Admin!');
    void this.router.navigateByUrl(this.safeReturnUrl());
  }

  private safeReturnUrl(): string {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (returnUrl?.startsWith('/') && !returnUrl.startsWith('//')) {
      return returnUrl;
    }

    return '/dashboard';
  }
}
