import { Component } from '@angular/core';
import { LucideShieldCheck } from '@lucide/angular';
import { NzTagModule } from 'ng-zorro-antd/tag';

@Component({
  selector: 'app-footer',
  imports: [NzTagModule, LucideShieldCheck],
  template: `
    <footer class="mt-auto border-t border-[#D2D2D2] bg-white py-3 text-xs text-[#787676]">
      <div
        class="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-3 sm:flex-row sm:px-4 lg:px-6"
      >
        <div class="flex items-center gap-2">
          <svg lucideShieldCheck class="h-4 w-4 text-[#1350DF]" aria-hidden="true"></svg>
          <span class="font-medium text-[#101828]">VDTSL Starter</span>
          <span>v1.0.0</span>
        </div>

        <div class="flex flex-wrap items-center justify-center gap-1.5">
          <nz-tag nzColor="success">Standalone 21+</nz-tag>
          <nz-tag nzColor="processing">Layouts</nz-tag>
          <nz-tag nzColor="purple">AES-GCM</nz-tag>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {}
