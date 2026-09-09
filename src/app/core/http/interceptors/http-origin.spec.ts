import { describe, expect, it } from 'vitest';

import { isTrustedInternalRequest } from '@core/http/interceptors/http-origin';

describe('isTrustedInternalRequest', () => {
  it('trusts relative URLs', () => {
    expect(isTrustedInternalRequest('/users', [])).toBe(true);
  });

  it('trusts configured internal origins', () => {
    expect(
      isTrustedInternalRequest('https://api.example.internal/users', [
        'https://api.example.internal',
      ]),
    ).toBe(true);
  });

  it('does not trust external origins', () => {
    expect(
      isTrustedInternalRequest('https://external.example/users', ['https://api.example.internal']),
    ).toBe(false);
  });
});
