export function isTrustedInternalRequest(url: string, trustedOrigins: readonly string[]): boolean {
  if (url.startsWith('/')) {
    return true;
  }

  const currentOrigin = globalThis.location?.origin ?? 'http://localhost';
  const parsedUrl = new URL(url, currentOrigin);

  return trustedOrigins.includes(parsedUrl.origin);
}
