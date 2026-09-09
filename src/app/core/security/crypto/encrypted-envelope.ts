import { fromBase64Url, toBase64Url } from '@core/security/crypto/base64-url';

export interface EncryptedEnvelope {
  version: 1;
  algorithm: 'A256GCM';
  iv: Uint8Array<ArrayBuffer>;
  ciphertext: Uint8Array<ArrayBuffer>;
  tag: Uint8Array<ArrayBuffer>;
}

export function serializeEnvelope(envelope: EncryptedEnvelope): string {
  return `v${envelope.version}.${toBase64Url(envelope.iv)}.${toBase64Url(envelope.ciphertext)}.${toBase64Url(
    envelope.tag,
  )}`;
}

export function parseEnvelope(value: string): EncryptedEnvelope {
  const parts = value.split('.');
  const [version, iv, ciphertext, tag] = parts;

  if (parts.length !== 4 || version !== 'v1' || !iv || !ciphertext || !tag) {
    throw new Error('Unsupported or malformed encrypted envelope.');
  }

  const decodedIv = fromBase64Url(iv);
  const decodedCiphertext = fromBase64Url(ciphertext);
  const decodedTag = fromBase64Url(tag);

  if (decodedIv.length !== 12 || decodedCiphertext.length === 0 || decodedTag.length !== 16) {
    throw new Error('Malformed encrypted envelope.');
  }

  return {
    version: 1,
    algorithm: 'A256GCM',
    iv: decodedIv,
    ciphertext: decodedCiphertext,
    tag: decodedTag,
  };
}
