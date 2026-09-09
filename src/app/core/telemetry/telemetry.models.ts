// Telemetry payloads must never include credentials, keys, session data, or raw PII.

export type TelemetryEventName = string;

export interface TelemetryEvent {
  readonly name: TelemetryEventName;
  readonly properties?: Record<string, string | number | boolean>;
}

// Replace the default no-op telemetry provider in production.
export interface TelemetryService {
  trackEvent(event: TelemetryEvent): void;
  trackError(error: Error, context?: Record<string, string>): void;
  trackPageView(path: string): void;
}
