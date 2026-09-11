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

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
  }

  public async fetch<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
}

export const apiClient = new ApiClient();
