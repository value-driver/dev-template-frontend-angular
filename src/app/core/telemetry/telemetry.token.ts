import { InjectionToken } from '@angular/core';
import { TelemetryService } from '@core/telemetry/telemetry.models';

// Default telemetry is intentionally inert.
const noOpTelemetry: TelemetryService = {
  trackEvent: () => void 0,
  trackError: () => void 0,
  trackPageView: () => void 0,
};

// Provide a production telemetry adapter through this token.
export const TELEMETRY_SERVICE = new InjectionToken<TelemetryService>('TELEMETRY_SERVICE', {
  providedIn: 'root',
  factory: () => noOpTelemetry,
});
