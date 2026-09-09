import { inject, Injectable } from '@angular/core';

import { CryptoService } from '@core/security/crypto/crypto.service';
import { RuntimeConfigService } from '@core/config/runtime-config.service';

const STORE_NAME = 'crypto-keys';
const DEFAULT_KEY_ID = 'default-a256gcm';

@Injectable({ providedIn: 'root' })
export class KeyStoreService {
  private readonly cryptoService = inject(CryptoService);
  private readonly runtimeConfig = inject(RuntimeConfigService);

  async getOrCreateKey(): Promise<CryptoKey> {
    const existing = await this.getKey(DEFAULT_KEY_ID);
    if (existing) {
      return existing;
    }

    const key = await this.cryptoService.generateKey();
    await this.putKey(DEFAULT_KEY_ID, key);
    return key;
  }

  private async getKey(id: string): Promise<CryptoKey | null> {
    const db = await this.openDb();
    return new Promise<CryptoKey | null>((resolve, reject) => {
      const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(id);
      request.onsuccess = () => resolve((request.result as CryptoKey | undefined) ?? null);
      request.onerror = () => reject(request.error);
    });
  }

  private async putKey(id: string, key: CryptoKey): Promise<void> {
    const db = await this.openDb();
    return new Promise<void>((resolve, reject) => {
      const request = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).put(key, id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async openDb(): Promise<IDBDatabase> {
    if (!globalThis.indexedDB) {
      throw new Error('Secure key persistence requires IndexedDB support.');
    }

    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(
        `${this.runtimeConfig.config().secureStorageNamespace}-secure-storage`,
        1,
      );
      request.onupgradeneeded = () => {
        request.result.createObjectStore(STORE_NAME);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}
