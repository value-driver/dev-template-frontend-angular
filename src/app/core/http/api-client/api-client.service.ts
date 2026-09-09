import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { RuntimeConfigService } from '@core/config/runtime-config.service';

export interface ApiRequestOptions {
  params?: Record<string, string | number | boolean | readonly (string | number | boolean)[]>;
}

@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);
  private readonly runtimeConfig = inject(RuntimeConfigService);

  get<T>(path: string, options: ApiRequestOptions = {}): Observable<T> {
    return this.http.get<T>(this.internalUrl(path), {
      params: this.toParams(options.params),
    });
  }

  post<TResponse, TBody>(path: string, body: TBody): Observable<TResponse> {
    return this.http.post<TResponse>(this.internalUrl(path), body);
  }

  put<TResponse, TBody>(path: string, body: TBody): Observable<TResponse> {
    return this.http.put<TResponse>(this.internalUrl(path), body);
  }

  patch<TResponse, TBody>(path: string, body: TBody): Observable<TResponse> {
    return this.http.patch<TResponse>(this.internalUrl(path), body);
  }

  delete<TResponse>(path: string): Observable<TResponse> {
    return this.http.delete<TResponse>(this.internalUrl(path));
  }

  externalGet<T>(url: string, options: ApiRequestOptions = {}): Observable<T> {
    return this.http.get<T>(url, {
      params: this.toParams(options.params),
    });
  }

  private internalUrl(path: string): string {
    return new URL(
      path,
      this.runtimeConfig.config().apiBaseUrl.endsWith('/')
        ? this.runtimeConfig.config().apiBaseUrl
        : `${this.runtimeConfig.config().apiBaseUrl}/`,
    ).toString();
  }

  private toParams(params?: ApiRequestOptions['params']): HttpParams | undefined {
    if (!params) {
      return undefined;
    }

    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          httpParams = httpParams.append(key, String(item));
        }
      } else {
        httpParams = httpParams.set(key, String(value));
      }
    }

    return httpParams;
  }
}
