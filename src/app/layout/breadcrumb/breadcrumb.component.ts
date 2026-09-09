import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideChevronRight, LucideHome } from '@lucide/angular';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';

import { PageTitleBreadcrumbService } from '@core/layout/page-title-breadcrumb.service';

@Component({
  selector: 'app-breadcrumb',
  imports: [RouterLink, NzBreadCrumbModule, LucideChevronRight, LucideHome],
  template: `
    @if (breadcrumbs().length > 0) {
      <nav aria-label="Breadcrumbs" class="flex items-center text-xs text-[#787676]">
        <ol class="flex flex-wrap items-center gap-1.5 list-none p-0 m-0">
          <li class="inline-flex items-center">
            <a
              routerLink="/"
              class="inline-flex items-center gap-1 text-[#787676] hover:text-[#1350DF] transition"
              aria-label="Home"
            >
              <svg lucideHome class="h-3.5 w-3.5" aria-hidden="true"></svg>
            </a>
          </li>

          @for (item of breadcrumbs(); track $index) {
            <li class="inline-flex items-center gap-1.5">
              <svg lucideChevronRight class="h-3 w-3 text-[#9aa8be]" aria-hidden="true"></svg>
              @if (item.active || !item.url) {
                <span class="font-medium text-[#101828]" aria-current="page">
                  {{ item.label }}
                </span>
              } @else {
                <a [routerLink]="item.url" class="text-[#787676] hover:text-[#1350DF] transition">
                  {{ item.label }}
                </a>
              }
            </li>
          }
        </ol>
      </nav>
    }
  `,
})
export class BreadcrumbComponent {
  private readonly breadcrumbService = inject(PageTitleBreadcrumbService);
  protected readonly breadcrumbs = this.breadcrumbService.breadcrumbs;
}
