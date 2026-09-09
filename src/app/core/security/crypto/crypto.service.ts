import { Injectable } from '@angular/core';

import { toBase64Url } from '@core/security/crypto/base64-url';
import { parseEnvelope, serializeEnvelope } from '@core/security/crypto/encrypted-envelope';

const AES_GCM_TAG_LENGTH_BITS = 128;
const AES_GCM_TAG_LENGTH_BYTES = 16;
const AES_GCM_IV_LENGTH_BYTES = 12;

@Injectable({ providedIn: 'root' })
export class CryptoService {
  private readonly encoder = new TextEncoder();
  private readonly decoder = new TextDecoder();

  async generateKey(): Promise<CryptoKey> {
    return crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      false,
      ['encrypt', 'decrypt'],
    );
  }

  async hashKey(key: string, namespace: string): Promise<string> {
    const data = this.encoder.encode(`${namespace}:key:${key}`);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return `${namespace}:k_${toBase64Url(new Uint8Array(digest))}`;
  }

  async encryptJson<T>(value: T, key: CryptoKey, aad?: string): Promise<string> {
    const iv = crypto.getRandomValues(new Uint8Array(AES_GCM_IV_LENGTH_BYTES));
    const plaintext = this.encoder.encode(JSON.stringify(value));
    const encrypted = new Uint8Array(
      await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv,
          tagLength: AES_GCM_TAG_LENGTH_BITS,
          additionalData: aad ? this.encoder.encode(aad) : undefined,
        },
        key,
        plaintext,
      ),
    );

    return serializeEnvelope({
      version: 1,
      algorithm: 'A256GCM',
      iv,
      ciphertext: encrypted.slice(0, -AES_GCM_TAG_LENGTH_BYTES),
      tag: encrypted.slice(-AES_GCM_TAG_LENGTH_BYTES),
    });
  }

  async decryptJson<T>(value: string, key: CryptoKey, aad?: string): Promise<T> {
    const envelope = parseEnvelope(value);
    const encrypted = new Uint8Array(envelope.ciphertext.length + envelope.tag.length);
    encrypted.set(envelope.ciphertext);
    encrypted.set(envelope.tag, envelope.ciphertext.length);

    const plaintext = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: envelope.iv,
        tagLength: AES_GCM_TAG_LENGTH_BITS,
        additionalData: aad ? this.encoder.encode(aad) : undefined,
      },
      key,
      encrypted,
    );

    return JSON.parse(this.decoder.decode(plaintext)) as T;
  }
}
