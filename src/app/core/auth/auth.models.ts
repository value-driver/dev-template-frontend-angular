// User identity from the authenticated backend session; never persist credentials in browser storage.
export interface AuthUser {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
  readonly roles: ReadonlyArray<string>;
}

export const DEMO_AUTH_USER: AuthUser = {
  id: 'demo-admin',
  email: 'admin@enterprise.internal',
  displayName: 'Enterprise Admin',
  roles: ['SuperAdmin'],
};
