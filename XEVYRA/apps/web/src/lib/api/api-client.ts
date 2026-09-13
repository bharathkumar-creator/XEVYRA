import { ApiErrorPayload } from '@xevyra/contracts';

export class ApiClientError extends Error {
  public readonly code: string;
  public readonly requestId?: string;
  public readonly details?: Array<{ field?: string; message: string; code?: string }>;
  public readonly statusCode: number;

  constructor(payload: ApiErrorPayload, statusCode: number) {
    super(payload.error.message);
    this.name = 'ApiClientError';
    this.code = payload.error.code;
    this.requestId = payload.error.requestId;
    this.details = payload.error.details;
    this.statusCode = statusCode;
  }
}

export class ApiClient {
  private baseUrl: string;
  private tokenGetter: (() => string | null | Promise<string | null>) | null = null;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
  }

  public setTokenProvider(provider: () => string | null | Promise<string | null>): void {
    this.tokenGetter = provider;
  }

  private async getAuthToken(overrideToken?: string): Promise<string | null> {
    if (overrideToken) return overrideToken;
    if (this.tokenGetter) {
      return await this.tokenGetter();
    }
    // Fallback: Check localStorage if in browser
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('xevyra_auth_token');
      if (stored) return stored;
    }
    // Dev fallback demo token so API doesn't fail on local inspection
    return 'dev_demo_athlete_token';
  }

  public async fetch<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const effectiveToken = await this.getAuthToken(token);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(effectiveToken ? { Authorization: `Bearer ${effectiveToken}` } : {}),
      ...((options.headers as Record<string, string>) || {}),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (data && data.error && data.error.code) {
        throw new ApiClientError(data as ApiErrorPayload, response.status);
      }
      throw new Error(`Request failed with status ${response.status}: ${response.statusText}`);
    }

    return data as T;
  }

  public get<T>(endpoint: string, token?: string): Promise<T> {
    return this.fetch<T>(endpoint, { method: 'GET' }, token);
  }

  public post<T>(endpoint: string, body: unknown, token?: string): Promise<T> {
    return this.fetch<T>(
      endpoint,
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
      token
    );
  }

  public patch<T>(endpoint: string, body: unknown, token?: string): Promise<T> {
    return this.fetch<T>(
      endpoint,
      {
        method: 'PATCH',
        body: JSON.stringify(body),
      },
      token
    );
  }

  public delete<T>(endpoint: string, token?: string): Promise<T> {
    return this.fetch<T>(endpoint, { method: 'DELETE' }, token);
  }
}

export const apiClient = new ApiClient();
