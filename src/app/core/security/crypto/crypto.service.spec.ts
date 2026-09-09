import { describe, expect, it } from 'vitest';

import { CryptoService } from '@core/security/crypto/crypto.service';

describe('CryptoService', () => {
  it('encrypts and decrypts JSON values', async () => {
    const service = new CryptoService();
    const key = await service.generateKey();

    const encrypted = await service.encryptJson({ density: 'compact' }, key, 'settings:v1');
    const decrypted = await service.decryptJson<{ density: string }>(encrypted, key, 'settings:v1');

    expect(decrypted).toEqual({ density: 'compact' });
    expect(encrypted).toMatch(/^v1\./);
  });

  it('encrypts and decrypts complex nested objects', async () => {
    const service = new CryptoService();
    const key = await service.generateKey();
    const payload = { user: { id: 42, prefs: { density: 'compact', lang: 'en' } } };

    const encrypted = await service.encryptJson(payload, key);
    const decrypted = await service.decryptJson<typeof payload>(encrypted, key);

    expect(decrypted).toEqual(payload);
  });

  it('generates a non-exportable AES-GCM-256 CryptoKey', async () => {
    const service = new CryptoService();
    const key = await service.generateKey();

    expect(key.type).toBe('secret');
    expect(key.algorithm).toMatchObject({ name: 'AES-GCM', length: 256 });
    expect(key.extractable).toBe(false);
    expect(key.usages).toContain('encrypt');
    expect(key.usages).toContain('decrypt');
  });

  it('generates two distinct keys that cannot decrypt each other', async () => {
    const service = new CryptoService();
    const key1 = await service.generateKey();
    const key2 = await service.generateKey();

    const encrypted = await service.encryptJson({ v: 1 }, key1);
    await expect(service.decryptJson(encrypted, key2)).rejects.toThrow();
  });

  it('generates a unique IV for each encryption operation', async () => {
    const service = new CryptoService();
    const key = await service.generateKey();

    const first = await service.encryptJson({ value: 1 }, key);
    const second = await service.encryptJson({ value: 1 }, key);

    expect(first.split('.')[1]).not.toBe(second.split('.')[1]);
  });

  it('rejects tampered ciphertext', async () => {
    const service = new CryptoService();
    const key = await service.generateKey();
    const encrypted = await service.encryptJson({ value: 1 }, key);
    const parts = encrypted.split('.');
    // Corrupt the envelope while preserving Base64.
    const mid = Math.floor(parts[2].length / 2);
    const original = parts[2][mid];
    parts[2] = parts[2].slice(0, mid) + (original === 'A' ? 'B' : 'A') + parts[2].slice(mid + 1);

    await expect(service.decryptJson(parts.join('.'), key)).rejects.toThrow();
  });

  it('rejects tampered IV', async () => {
    const service = new CryptoService();
    const key = await service.generateKey();
    const encrypted = await service.encryptJson({ value: 1 }, key);
    const parts = encrypted.split('.');
    const mid = Math.floor(parts[1].length / 2);
    const original = parts[1][mid];
    parts[1] = parts[1].slice(0, mid) + (original === 'A' ? 'B' : 'A') + parts[1].slice(mid + 1);

    await expect(service.decryptJson(parts.join('.'), key)).rejects.toThrow();
  });

  it('rejects tampered authentication tag', async () => {
    const service = new CryptoService();
    const key = await service.generateKey();
    const encrypted = await service.encryptJson({ value: 1 }, key);
    const parts = encrypted.split('.');
    const mid = Math.floor(parts[3].length / 2);
    const original = parts[3][mid];
    parts[3] = parts[3].slice(0, mid) + (original === 'A' ? 'B' : 'A') + parts[3].slice(mid + 1);

    await expect(service.decryptJson(parts.join('.'), key)).rejects.toThrow();
  });

  it('rejects decryption with the wrong key', async () => {
    const service = new CryptoService();
    const correctKey = await service.generateKey();
    const wrongKey = await service.generateKey();

    const encrypted = await service.encryptJson({ secret: 'value' }, correctKey);

    await expect(service.decryptJson(encrypted, wrongKey)).rejects.toThrow();
  });

  it('rejects mismatched additional authenticated data', async () => {
    const service = new CryptoService();
    const key = await service.generateKey();
    const encrypted = await service.encryptJson({ value: 1 }, key, 'settings:v1');

    await expect(service.decryptJson(encrypted, key, 'other:v1')).rejects.toThrow();
  });

  it('rejects AAD-protected data decrypted without AAD', async () => {
    const service = new CryptoService();
    const key = await service.generateKey();
    const encrypted = await service.encryptJson({ value: 1 }, key, 'settings:v1');

    await expect(service.decryptJson(encrypted, key)).rejects.toThrow();
  });

  it('rejects a completely malformed envelope', async () => {
    const service = new CryptoService();
    const key = await service.generateKey();

    await expect(service.decryptJson('not-a-valid-envelope', key)).rejects.toThrow();
  });

  it('rejects an envelope with an unsupported version prefix', async () => {
    const service = new CryptoService();
    const key = await service.generateKey();

    await expect(service.decryptJson('v2.aGVsbG8.d29ybGQ.dGFn', key)).rejects.toThrow();
  });

  it('rejects an envelope with too few segments', async () => {
    const service = new CryptoService();
    const key = await service.generateKey();

    await expect(service.decryptJson('v1.onlytwoparts', key)).rejects.toThrow();
  });

  it('rejects an envelope with extra segments', async () => {
    const service = new CryptoService();
    const key = await service.generateKey();
    const encrypted = await service.encryptJson({ value: 1 }, key);

    await expect(service.decryptJson(`${encrypted}.unexpected`, key)).rejects.toThrow();
  });

  it('rejects an envelope with an invalid IV length', async () => {
    const service = new CryptoService();
    const key = await service.generateKey();
    const parts = (await service.encryptJson({ value: 1 }, key)).split('.');
    parts[1] = 'AA';

    await expect(service.decryptJson(parts.join('.'), key)).rejects.toThrow();
  });
});
