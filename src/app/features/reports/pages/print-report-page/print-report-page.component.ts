import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowLeft, LucidePrinter, LucideShieldCheck } from '@lucide/angular';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { ToastService } from '@core/feedback/toast.service';

@Component({
  selector: 'app-print-report-page',
  imports: [
    RouterLink,
    NzButtonModule,
    NzCardModule,
    NzTagModule,
    NzTableModule,
    LucidePrinter,
    LucideArrowLeft,
    LucideShieldCheck,
  ],
  template: `
    <div class="mx-auto max-w-5xl p-3 sm:p-6">
      <div
        class="print:hidden mb-4 flex flex-col gap-3 rounded-lg border border-[#D2D2D2] bg-[#F9F9F9] p-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="flex flex-wrap items-center gap-2">
          <a
            routerLink="/dashboard"
            nz-button
            nzType="default"
            class="flex items-center gap-1.5 text-xs font-semibold"
          >
            <svg lucideArrowLeft class="h-4 w-4" aria-hidden="true"></svg>
            <span>Dashboard</span>
          </a>
          <span class="text-xs text-[#787676]">Print preview</span>
        </div>

        <button
          nz-button
          nzType="primary"
          (click)="printDoc()"
          class="flex items-center gap-1.5 bg-[#1350DF] text-xs font-semibold"
        >
          <svg lucidePrinter class="h-4 w-4" aria-hidden="true"></svg>
          <span>Print</span>
        </button>
      </div>

      <div class="rounded-lg border border-[#D2D2D2] bg-white p-4 print:border-none print:p-0">
        <div
          class="flex flex-col gap-3 border-b border-[#D2D2D2] pb-4 sm:flex-row sm:items-start sm:justify-between"
        >
          <div>
            <div class="flex items-center gap-2 text-[#1350DF]">
              <svg lucideShieldCheck class="h-6 w-6" aria-hidden="true"></svg>
              <span class="text-sm font-bold tracking-wider uppercase">Security Audit</span>
            </div>
            <h1 class="mt-2 text-xl font-semibold text-[#101828]">Frontend Compliance</h1>
            <p class="mt-1 text-xs text-[#787676]">Generated {{ currentDate }}</p>
          </div>

          <div class="text-right">
            <nz-tag nzColor="success" class="text-xs px-2.5 py-1 font-semibold"
              >100% PASSING</nz-tag
            >
            <div class="mt-2 text-[11px] font-mono text-[#787676]">ID: AUDIT-2026-8892</div>
          </div>
        </div>

        <div class="my-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div class="rounded-lg border border-[#D2D2D2] p-3">
            <div class="text-xs text-[#787676]">Crypto</div>
            <div class="mt-1 text-lg font-bold text-[#101828]">AES-256-GCM</div>
            <div class="text-[10px] text-emerald-600">Non-exportable key</div>
          </div>

          <div class="rounded-lg border border-[#D2D2D2] p-3">
            <div class="text-xs text-[#787676]">Boundaries</div>
            <div class="mt-1 text-lg font-bold text-emerald-600">0</div>
            <div class="text-[10px] text-[#787676]">Architecture gate</div>
          </div>

          <div class="rounded-lg border border-[#D2D2D2] p-3">
            <div class="text-xs text-[#787676]">Layouts</div>
            <div class="mt-1 text-lg font-bold text-[#101828]">3</div>
            <div class="text-[10px] text-blue-600">App, auth, print</div>
          </div>
        </div>

        <div class="mt-4">
          <h2 class="text-sm font-bold uppercase tracking-wider text-[#787676] mb-3">Checks</h2>
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-[#D2D2D2] text-[#787676]">
                <th class="py-2.5 font-semibold">Area</th>
                <th class="py-2.5 font-semibold">Requirement</th>
                <th class="py-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#D2D2D2]">
              <tr>
                <td class="py-3 font-semibold text-[#101828]">HTTP Security</td>
                <td class="py-3 text-[#333333]">Origin check before auth headers</td>
                <td class="py-3"><nz-tag nzColor="success">Compliant</nz-tag></td>
              </tr>
              <tr>
                <td class="py-3 font-semibold text-[#101828]">Browser Storage</td>
                <td class="py-3 text-[#333333]">No raw credentials in localStorage</td>
                <td class="py-3"><nz-tag nzColor="success">Compliant</nz-tag></td>
              </tr>
              <tr>
                <td class="py-3 font-semibold text-[#101828]">UI Multi-Layout</td>
                <td class="py-3 text-[#333333]">Layout, breadcrumb, feedback bridge</td>
                <td class="py-3"><nz-tag nzColor="success">Compliant</nz-tag></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class PrintReportPageComponent {
  private readonly toast = inject(ToastService);
  protected readonly currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  printDoc(): void {
    this.toast.info('Opening system print dialog...');
    window.print();
  }
}
