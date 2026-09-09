import { DestroyRef, inject, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NetworkStatusService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly onlineState = signal(true);

  readonly online = this.onlineState.asReadonly();

  constructor() {
    if (typeof window === 'undefined') return;

    this.onlineState.set(navigator.onLine);
    const updateStatus = (): void => this.onlineState.set(navigator.onLine);
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    });
  }
}
