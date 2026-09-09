import { Component, inject } from '@angular/core';
import { LucideWifiOff } from '@lucide/angular';

import { NetworkStatusService } from '@core/network/network-status.service';

@Component({
  selector: 'app-network-status',
  imports: [LucideWifiOff],
  template: `
    @if (!online()) {
      <div
        role="status"
        class="border-b border-[#F24150] bg-[#FFF5F5] px-4 py-2 text-center text-xs font-medium text-[#B42318]"
      >
        <span class="inline-flex items-center gap-2">
          <svg lucideWifiOff class="h-3.5 w-3.5" aria-hidden="true"></svg>
          Offline — reconnect to continue.
        </span>
      </div>
    }
  `,
})
export class NetworkStatusComponent {
  private readonly networkStatus = inject(NetworkStatusService);
  protected readonly online = this.networkStatus.online;
}
