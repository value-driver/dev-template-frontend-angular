import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import {
  LucideChevronRight,
  LucideFileText,
  LucideLayoutDashboard,
  LucideLogIn,
  LucidePrinter,
  LucideSettings,
  LucideShieldCheck,
} from '@lucide/angular';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { filter } from 'rxjs';

import { AuthSessionService } from '@core/auth/auth-session.service';

type LucideNavIcon = 'dashboard' | 'file' | 'login' | 'print' | 'settings' | 'shield';

type NavIcon =
  | LucideNavIcon
  | { readonly kind: 'lucide'; readonly name: LucideNavIcon }
  | { readonly kind: 'image'; readonly src: string; readonly alt?: string }
  | {
      readonly kind: 'class';
      readonly className: string;
      readonly text?: string;
      readonly ariaLabel?: string;
    };

type ResolvedNavIcon =
  | { readonly kind: 'lucide'; readonly name: LucideNavIcon }
  | { readonly kind: 'image'; readonly src: string; readonly alt?: string }
  | {
      readonly kind: 'class';
      readonly className: string;
      readonly text?: string;
      readonly ariaLabel?: string;
    };

interface NavItem {
  readonly id: string;
  readonly label: string;
  readonly icon: NavIcon;
  readonly path?: string;
  readonly exact?: boolean;
  readonly badge?: string;
  readonly badgeColor?: string;
  readonly children?: readonly NavItem[];
  readonly visible?: () => boolean;
}

interface NavSection {
  readonly id: string;
  readonly label: string;
  readonly badge?: string;
  readonly badgeColor?: string;
  readonly items: readonly NavItem[];
}

@Component({
  selector: 'app-navigation',
  imports: [
    RouterLink,
    NgTemplateOutlet,
    NzTagModule,
    LucideChevronRight,
    LucideLayoutDashboard,
    LucideSettings,
    LucideLogIn,
    LucidePrinter,
    LucideFileText,
    LucideShieldCheck,
  ],
  template: `
    <nav class="rounded-lg border border-[#D2D2D2] bg-white p-2" aria-label="Primary navigation">
      <div
        class="mb-1.5 flex items-center justify-between px-1.5 text-[11px] font-bold uppercase tracking-wider text-[#787676]"
      >
        <span>Navigation</span>
        <nz-tag nzColor="blue" class="m-0 text-[10px]">v1.0</nz-tag>
      </div>

      <div class="grid gap-2">
        @for (section of visibleSections(); track section.id) {
          <section class="grid gap-0.5">
            <div
              class="flex items-center justify-between px-1.5 text-[10px] font-bold uppercase tracking-wider text-[#787676]"
            >
              <span>{{ section.label }}</span>
              @if (section.badge) {
                <nz-tag [nzColor]="section.badgeColor ?? 'default'" class="m-0 text-[10px]">
                  {{ section.badge }}
                </nz-tag>
              }
            </div>

            <div class="grid gap-1">
              @for (item of section.items; track item.id) {
                @if (item.children?.length) {
                  <div [class]="parentGroupClass(item)">
                    <button
                      type="button"
                      [class]="parentItemClass(item)"
                      [attr.aria-expanded]="isParentExpanded(item)"
                      [attr.aria-controls]="parentPanelId(item)"
                      (click)="toggleParent(item)"
                    >
                      <span class="flex min-w-0 items-center gap-2">
                        <ng-container
                          *ngTemplateOutlet="
                            menuIcon;
                            context: { $implicit: item.icon, iconClass: 'h-4 w-4' }
                          "
                        ></ng-container>
                        <span class="truncate">{{ item.label }}</span>
                      </span>

                      <span class="flex items-center gap-1">
                        @if (item.badge) {
                          <nz-tag [nzColor]="item.badgeColor ?? 'default'" class="m-0 text-[10px]">
                            {{ item.badge }}
                          </nz-tag>
                        }
                        <svg
                          lucideChevronRight
                          [class]="parentChevronClass(item)"
                          aria-hidden="true"
                        ></svg>
                      </span>
                    </button>

                    @if (isParentExpanded(item)) {
                      <div
                        [id]="parentPanelId(item)"
                        class="mt-0.5 grid gap-0.5 border-l border-[#D2D2D2] pl-2"
                      >
                        @for (child of item.children; track child.id) {
                          <a
                            [routerLink]="pathFor(child)"
                            [class]="childItemClass(child)"
                            [attr.aria-current]="isItemActive(child) ? 'page' : null"
                          >
                            <span class="flex min-w-0 items-center gap-2">
                              <ng-container
                                *ngTemplateOutlet="
                                  menuIcon;
                                  context: { $implicit: child.icon, iconClass: 'h-3.5 w-3.5' }
                                "
                              ></ng-container>
                              <span class="truncate">{{ child.label }}</span>
                            </span>

                            @if (child.badge) {
                              <nz-tag
                                [nzColor]="child.badgeColor ?? 'default'"
                                class="m-0 text-[10px]"
                              >
                                {{ child.badge }}
                              </nz-tag>
                            }
                          </a>
                        }
                      </div>
                    }
                  </div>
                } @else {
                  <a
                    [routerLink]="pathFor(item)"
                    [class]="rootItemClass(item)"
                    [attr.aria-current]="isItemActive(item) ? 'page' : null"
                  >
                    <span class="flex min-w-0 items-center gap-2.5">
                      <ng-container
                        *ngTemplateOutlet="
                          menuIcon;
                          context: { $implicit: item.icon, iconClass: 'h-4 w-4' }
                        "
                      ></ng-container>
                      <span class="truncate">{{ item.label }}</span>
                    </span>

                    @if (item.badge) {
                      <nz-tag [nzColor]="item.badgeColor ?? 'default'" class="m-0 text-[10px]">
                        {{ item.badge }}
                      </nz-tag>
                    }
                  </a>
                }
              }
            </div>
          </section>
        }
      </div>
    </nav>

    <ng-template #menuIcon let-icon let-iconClass="iconClass">
      @let iconConfig = resolveIcon(icon);

      @switch (iconConfig.kind) {
        @case ('image') {
          <img
            [src]="iconConfig.src"
            [alt]="iconConfig.alt ?? ''"
            [class]="imageIconClass(iconClass)"
          />
        }
        @case ('class') {
          <span
            [class]="classIconClass(iconConfig.className, iconClass)"
            [attr.aria-hidden]="iconConfig.ariaLabel ? null : 'true'"
            [attr.aria-label]="iconConfig.ariaLabel ?? null"
            >{{ iconConfig.text ?? '' }}</span
          >
        }
        @default {
          @switch (iconConfig.name) {
            @case ('dashboard') {
              <svg lucideLayoutDashboard class="shrink-0 {{ iconClass }}" aria-hidden="true"></svg>
            }
            @case ('settings') {
              <svg lucideSettings class="shrink-0 {{ iconClass }}" aria-hidden="true"></svg>
            }
            @case ('shield') {
              <svg lucideShieldCheck class="shrink-0 {{ iconClass }}" aria-hidden="true"></svg>
            }
            @case ('login') {
              <svg lucideLogIn class="shrink-0 {{ iconClass }}" aria-hidden="true"></svg>
            }
            @case ('print') {
              <svg lucidePrinter class="shrink-0 {{ iconClass }}" aria-hidden="true"></svg>
            }
            @default {
              <svg lucideFileText class="shrink-0 {{ iconClass }}" aria-hidden="true"></svg>
            }
          }
        }
      }
    </ng-template>
  `,
})
export class NavigationComponent {
  private readonly router = inject(Router);
  private readonly authSession = inject(AuthSessionService);

  private readonly menuSections: readonly NavSection[] = [
    {
      id: 'workspace',
      label: 'Workspace',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: 'dashboard',
          path: '/dashboard',
          exact: true,
        },
        {
          id: 'security',
          label: 'Security',
          icon: 'shield',
          badge: 'AES',
          badgeColor: 'purple',
          visible: () => this.hasAnyRole(['SuperAdmin']),
          children: [
            {
              id: 'settings',
              label: 'Settings',
              icon: 'settings',
              path: '/settings',
              badge: 'AES-256',
              badgeColor: 'purple',
            },
          ],
        },
      ],
    },
    {
      id: 'system',
      label: 'System',
      items: [
        {
          id: 'layouts',
          label: 'Layouts',
          icon: 'file',
          children: [
            { id: 'auth-layout', label: 'Auth Layout', icon: 'login', path: '/auth/login' },
            { id: 'print-layout', label: 'Print Layout', icon: 'print', path: '/reports/print' },
          ],
        },
      ],
    },
  ];

  protected readonly expandedParentId = signal<string | null>(this.findActiveParentId());

  readonly visibleSections = computed(() =>
    this.menuSections
      .map((section) => ({
        ...section,
        items: section.items
          .filter((item) => this.isVisible(item))
          .map((item) => ({
            ...item,
            children: item.children?.filter((child) => this.isVisible(child)),
          }))
          .filter((item) => !item.children || item.children.length > 0),
      }))
      .filter((section) => section.items.length > 0),
  );

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        const activeParentId = this.findActiveParentId();
        if (activeParentId) {
          this.expandedParentId.set(activeParentId);
        }
      });
  }

  rootItemClass(item: NavItem): string {
    return this.itemClass(item, false);
  }

  childItemClass(item: NavItem): string {
    return this.itemClass(item, true);
  }

  parentGroupClass(item: NavItem): string {
    return this.isItemActive(item)
      ? 'rounded-md border border-[#B8DBFF] bg-[#EBF5FF] p-0.5'
      : 'rounded-md border border-[#EBF5FF] bg-[#F9F9F9] p-0.5';
  }

  parentItemClass(item: NavItem): string {
    const base =
      'flex min-h-[30px] w-full items-center justify-between gap-2 rounded-md border px-2 py-1 text-left text-xs font-semibold transition';
    if (this.isItemActive(item)) {
      return `${base} border-[#B8DBFF] bg-white text-[#1350DF]`;
    }

    if (this.isParentExpanded(item)) {
      return `${base} border-[#D2D2D2] bg-white text-[#101828]`;
    }

    return `${base} border-transparent text-[#333333] hover:bg-[#EBF5FF]`;
  }

  parentChevronClass(item: NavItem): string {
    const base = 'h-3.5 w-3.5 shrink-0 text-[#787676] transition-transform';
    return this.isParentExpanded(item) ? `${base} rotate-90` : base;
  }

  toggleParent(item: NavItem): void {
    if (!item.children?.length) {
      return;
    }

    this.expandedParentId.update((current) => (current === item.id ? null : item.id));
  }

  isParentExpanded(item: NavItem): boolean {
    return this.expandedParentId() === item.id;
  }

  parentPanelId(item: NavItem): string {
    return `nav-group-${item.id}`;
  }

  pathFor(item: NavItem): string {
    return item.path ?? '/dashboard';
  }

  isItemActive(item: NavItem): boolean {
    if (item.children?.some((child) => this.isItemActive(child))) {
      return true;
    }

    if (!item.path) {
      return false;
    }

    return this.router.isActive(item.path, {
      paths: item.exact ? 'exact' : 'subset',
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored',
    });
  }

  resolveIcon(icon: NavIcon): ResolvedNavIcon {
    if (typeof icon === 'string') {
      return { kind: 'lucide', name: icon };
    }

    return icon.kind === 'lucide' ? { kind: 'lucide', name: icon.name } : icon;
  }

  imageIconClass(iconClass: string): string {
    return `shrink-0 object-contain ${iconClass}`;
  }

  classIconClass(className: string, iconClass: string): string {
    return `inline-flex shrink-0 items-center justify-center ${iconClass} ${className}`;
  }

  private itemClass(item: NavItem, child: boolean): string {
    const base = child
      ? 'flex min-h-[30px] items-center justify-between gap-2 rounded-md border px-2 py-1 text-xs font-medium transition hover:bg-[#EBF5FF]'
      : 'flex min-h-8 items-center justify-between gap-2 rounded-md border px-2 py-1 text-sm font-medium transition hover:bg-[#EBF5FF]';
    return this.isItemActive(item)
      ? `${base} border-[#B8DBFF] bg-[#EBF5FF] text-[#1350DF] font-semibold`
      : `${base} border-transparent text-[#333333]`;
  }

  private findActiveParentId(): string | null {
    for (const section of this.menuSections) {
      for (const item of section.items) {
        if (item.children?.some((child) => this.isItemActive(child))) {
          return item.id;
        }
      }
    }

    return null;
  }

  private isVisible(item: NavItem): boolean {
    return item.visible ? item.visible() : true;
  }

  private hasAnyRole(roles: readonly string[]): boolean {
    const userRoles = this.authSession.currentUser()?.roles ?? [];
    return roles.some((role) => userRoles.includes(role));
  }
}
