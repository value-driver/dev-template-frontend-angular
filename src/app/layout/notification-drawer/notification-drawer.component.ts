import { Component, inject, signal } from '@angular/core';
import { LucideBell, LucideCheckCheck, LucideInfo, LucideShieldAlert } from '@lucide/angular';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';

import { ToastService } from '@core/feedback/toast.service';

export interface AppNotification {
  readonly id: string;
  readonly title: string;
  readonly message: string;
  readonly time: string;
  readonly type: 'info' | 'security' | 'success';
  read: boolean;
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n-1',
    title: 'IndexedDB Key Rotated',
    message: 'AES-256-GCM storage master key was verified and synchronized securely.',
    time: '5 mins ago',
    type: 'security',
    read: false,
  },
  {
    id: 'n-2',
    title: 'Architecture Rules Passed',
    message: 'Boundary isolation checks verified zero cross-feature domain leakages.',
    time: '25 mins ago',
    type: 'success',
    read: false,
  },
  {
    id: 'n-3',
    title: 'Enterprise Shell Initialized',
    message: 'Multi-layout engine and ValueDriver brand tokens are now operational.',
    time: '1 hour ago',
    type: 'info',
    read: true,
  },
];

@Component({
  selector: 'app-notification-drawer',
  imports: [
    NzButtonModule,
    NzBadgeModule,
    NzDrawerModule,
    NzTagModule,
    NzTooltipModule,
    LucideBell,
    LucideInfo,
    LucideShieldAlert,
    LucideCheckCheck,
  ],
  template: `
    <button
      nz-button
      nzType="text"
      (click)="openDrawer()"
      nz-tooltip="Notifications"
      class="relative flex h-9 w-9 items-center justify-center rounded-lg text-[#333333] hover:bg-[#EBF5FF]"
      aria-label="View system notifications"
    >
      <nz-badge [nzCount]="unreadCount()" [nzOverflowCount]="9" [nzOffset]="[-2, 2]">
        <svg lucideBell class="h-4 w-4" aria-hidden="true"></svg>
      </nz-badge>
    </button>

    <nz-drawer
      [nzClosable]="true"
      [nzVisible]="visible()"
      nzPlacement="right"
      nzTitle="System Notifications"
      [nzWidth]="380"
      (nzOnClose)="closeDrawer()"
      [nzExtra]="drawerExtra"
      [nzContent]="drawerContent"
    >
      <ng-template #drawerExtra>
        <div class="flex items-center gap-1">
          <button
            nz-button
            nzType="text"
            nzSize="small"
            (click)="markAllAsRead()"
            [disabled]="unreadCount() === 0"
            class="text-xs"
          >
            Mark all read
          </button>
        </div>
      </ng-template>

      <ng-template #drawerContent>
        <div class="divide-y divide-[#D2D2D2]">
          @for (item of notifications(); track item.id) {
            <div class="p-4 transition hover:bg-[#F9F9F9]" [class.bg-[#EBF5FF]/40]="!item.read">
              <div class="flex items-start justify-between gap-2">
                <div class="flex items-center gap-2">
                  @switch (item.type) {
                    @case ('security') {
                      <svg
                        lucideShieldAlert
                        class="h-4 w-4 text-purple-600"
                        aria-hidden="true"
                      ></svg>
                    }
                    @case ('success') {
                      <svg
                        lucideCheckCheck
                        class="h-4 w-4 text-emerald-600"
                        aria-hidden="true"
                      ></svg>
                    }
                    @default {
                      <svg lucideInfo class="h-4 w-4 text-blue-600" aria-hidden="true"></svg>
                    }
                  }
                  <span class="text-xs font-semibold text-[#101828]">{{ item.title }}</span>
                </div>

                <span class="text-[10px] text-[#787676]">{{ item.time }}</span>
              </div>

              <p class="mt-1.5 text-xs text-[#333333] leading-relaxed m-0">
                {{ item.message }}
              </p>

              @if (!item.read) {
                <div class="mt-2 flex justify-end">
                  <button
                    nz-button
                    nzType="link"
                    nzSize="small"
                    (click)="markAsRead(item.id)"
                    class="p-0 text-[11px] h-auto text-[#1350DF]"
                  >
                    Mark as read
                  </button>
                </div>
              }
            </div>
          } @empty {
            <div class="py-8 text-center text-xs text-[#787676]">
              No notifications at this time.
            </div>
          }
        </div>

        @if (notifications().length > 0) {
          <div class="mt-4 border-t border-[#D2D2D2] pt-4">
            <button nz-button nzBlock nzDanger nzType="dashed" (click)="clearAll()" class="text-xs">
              Clear All
            </button>
          </div>
        }
      </ng-template>
    </nz-drawer>
  `,
})
export class NotificationDrawerComponent {
  private readonly toast = inject(ToastService);

  protected readonly visible = signal(false);
  protected readonly notifications = signal<AppNotification[]>(INITIAL_NOTIFICATIONS);

  readonly unreadCount = () => this.notifications().filter((n) => !n.read).length;

  openDrawer(): void {
    this.visible.set(true);
  }

  closeDrawer(): void {
    this.visible.set(false);
  }

  markAsRead(id: string): void {
    this.notifications.update((list) =>
      list.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  }

  markAllAsRead(): void {
    this.notifications.update((list) => list.map((item) => ({ ...item, read: true })));
    this.toast.success('All notifications marked as read.');
  }

  clearAll(): void {
    this.notifications.set([]);
    this.toast.info('Notification inbox cleared.');
  }
}
