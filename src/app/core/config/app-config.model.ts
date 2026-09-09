export type AuthTransport = 'cookie' | 'bearer';

export interface AppConfig {
  apiBaseUrl: string;
  authTransport: AuthTransport;
  externalActivityUrl: string;
  environmentName: 'local' | 'development' | 'staging' | 'production';
  requestTimeoutMs: number;
  secureStorageNamespace: string;
  trustedInternalOrigins: string[];
}
