import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { RuntimeConfigService } from '@core/config/runtime-config.service';
import { CryptoService } from '@core/security/crypto/crypto.service';
import { KeyStoreService } from '@core/security/secure-storage/key-store.service';
import { SecureStorageService } from '@core/security/secure-storage/secure-storage.service';

describe('SecureStorageService', () => {
  let service: SecureStorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        SecureStorageService,
        {
          provide: RuntimeConfigService,
          useValue: {
            config: () => ({ secureStorageNamespace: 'frontend-starter' }),
          },
        },
        {
          provide: CryptoService,
          useValue: {
            hashKey: async (key: string, namespace: string) => `${namespace}:k_${key}`,
          },
        },
        { provide: KeyStoreService, useValue: {} },
      ],
    });
    service = TestBed.inject(SecureStorageService);
  });

  it('clears only entries belonging to its namespace', async () => {
    localStorage.setItem('frontend-starter:k_preferences', 'encrypted');
    localStorage.setItem('another-app:k_preferences', 'preserved');

    await service.clear();

    expect(localStorage.getItem('frontend-starter:k_preferences')).toBeNull();
    expect(localStorage.getItem('another-app:k_preferences')).toBe('preserved');
  });
});
