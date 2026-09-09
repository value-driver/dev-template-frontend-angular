import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideLock, LucideShieldCheck, LucideTrash2 } from '@lucide/angular';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { SecureStorageService } from '@core/security/secure-storage/secure-storage.service';
import { UserPreferences } from '@features/settings/models/settings.models';

const STORAGE_KEY = 'user-preferences';

const DEFAULT_PREFERENCES: UserPreferences = {
  compactDensity: false,
};

@Component({
  selector: 'app-settings-page',
  imports: [
    FormsModule,
    NzCardModule,
    NzFormModule,
    NzSwitchModule,
    NzButtonModule,
    NzAlertModule,
    NzDescriptionsModule,
    NzTagModule,
    NzDividerModule,
    LucideLock,
    LucideShieldCheck,
    LucideTrash2,
  ],
  templateUrl: './settings-page.component.html',
})
export class SettingsPageComponent implements OnInit {
  private readonly secureStorage = inject(SecureStorageService);

  protected readonly preferences = signal<UserPreferences>(DEFAULT_PREFERENCES);
  protected readonly hashedStorageKey = signal<string>('');
  protected readonly statusMessage = signal<string | null>(null);
  protected readonly statusType = signal<'success' | 'info' | 'warning' | 'error'>('info');
  protected readonly saving = signal(false);

  async ngOnInit(): Promise<void> {
    this.hashedStorageKey.set(await this.secureStorage.getStorageKey(STORAGE_KEY));
    await this.loadPreferences();
  }

  async loadPreferences(): Promise<void> {
    try {
      const saved = await this.secureStorage.get<UserPreferences>(STORAGE_KEY);
      if (saved) {
        this.preferences.set(saved);
        this.statusMessage.set(
          'Successfully retrieved and decrypted preferences from secure storage.',
        );
        this.statusType.set('success');
      } else {
        this.preferences.set(DEFAULT_PREFERENCES);
        this.statusMessage.set('No saved preferences found in storage. Default settings loaded.');
        this.statusType.set('info');
      }
    } catch {
      this.statusMessage.set('Failed to read or decrypt stored preferences.');
      this.statusType.set('error');
    }
  }

  protected setCompactDensity(compactDensity: boolean): void {
    this.preferences.update((current) => ({ ...current, compactDensity }));
  }

  protected async save(): Promise<void> {
    this.saving.set(true);
    try {
      await this.secureStorage.set(STORAGE_KEY, this.preferences());
      this.statusMessage.set(
        'Preferences were encrypted with AES-256-GCM and persisted without a plaintext fallback.',
      );
      this.statusType.set('success');
    } catch {
      this.statusMessage.set(
        'Secure storage write failed. Never falling back to unencrypted storage.',
      );
      this.statusType.set('error');
    } finally {
      this.saving.set(false);
    }
  }

  protected async clearStorage(): Promise<void> {
    try {
      await this.secureStorage.remove(STORAGE_KEY);
      this.preferences.set(DEFAULT_PREFERENCES);
      this.statusMessage.set('Secure storage entry cleared.');
      this.statusType.set('info');
    } catch {
      this.statusMessage.set('Failed to clear storage entry.');
      this.statusType.set('error');
    }
  }
}
