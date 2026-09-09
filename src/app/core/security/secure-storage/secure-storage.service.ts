import { inject, Injectable } from '@angular/core';

import { CryptoService } from '@core/security/crypto/crypto.service';
import { RuntimeConfigService } from '@core/config/runtime-config.service';
import { KeyStoreService } from '@core/security/secure-storage/key-store.service';
import { SecureStorage } from '@core/security/secure-storage/secure-storage';

@Injectable({ providedIn: 'root' })
export class SecureStorageService implements SecureStorage {
  private readonly cryptoService = inject(CryptoService);
  private readonly keyStore = inject(KeyStoreService);
  private readonly runtimeConfig = inject(RuntimeConfigService);

  async set<T>(key: string, value: T): Promise<void> {
    const cryptoKey = await this.keyStore.getOrCreateKey();
    const storageKey = await this.storageKey(key);
    const envelope = await this.cryptoService.encryptJson(value, cryptoKey, this.aad(key));
    localStorage.setItem(storageKey, envelope);
  }

  async get<T>(key: string): Promise<T | null> {
    const storageKey = await this.storageKey(key);
    const envelope = localStorage.getItem(storageKey);
    if (!envelope) {
      return null;
    }

    const cryptoKey = await this.keyStore.getOrCreateKey();
    return this.cryptoService.decryptJson<T>(envelope, cryptoKey, this.aad(key));
  }

  async remove(key: string): Promise<void> {
    const storageKey = await this.storageKey(key);
    localStorage.removeItem(storageKey);
  }

  async clear(): Promise<void> {
    const prefix = `${this.namespace()}:`;
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    }
  }

  async getStorageKey(key: string): Promise<string> {
    return this.storageKey(key);
  }

  private async storageKey(key: string): Promise<string> {
    return this.cryptoService.hashKey(key, this.namespace());
  }

  private aad(key: string): string {
    return `${this.namespace()}:${key}:v1`;
  }

  private namespace(): string {
    return this.runtimeConfig.config().secureStorageNamespace;
  }
}
