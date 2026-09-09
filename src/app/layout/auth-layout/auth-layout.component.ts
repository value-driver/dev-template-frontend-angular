import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { LucideShieldCheck } from '@lucide/angular';
import { NzTagModule } from 'ng-zorro-antd/tag';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, RouterLink, NzTagModule, LucideShieldCheck],
  template: `
    <div class="min-h-screen flex flex-col justify-between bg-[#F9F9F9] text-[#101828] p-3 sm:p-5">
      <header class="flex items-center justify-between mx-auto w-full max-w-4xl">
        <a routerLink="/" class="flex items-center gap-2 text-inherit no-underline">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1350DF] text-white">
            <svg lucideShieldCheck class="h-5 w-5" aria-hidden="true"></svg>
          </div>
          <div>
            <div class="text-[10px] font-bold uppercase tracking-wider text-[#1350DF]">
              ValueDriver
            </div>
            <div class="text-sm font-bold text-[#101828]">Security Gateway</div>
          </div>
        </a>

        <nz-tag nzColor="processing" class="m-0 text-[10px]">Secure Session</nz-tag>
      </header>

      <main class="my-auto flex justify-center py-6">
        <div class="w-full max-w-sm">
          <router-outlet />
        </div>
      </main>

      <footer class="text-center text-xs text-[#787676]">
        <p class="m-0">AES-GCM protected session</p>
      </footer>
    </div>
  `,
})
export class AuthLayoutComponent {}
