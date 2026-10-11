import { APIRequestContext, APIResponse } from '@playwright/test';

export interface ApiCallMetric {
  method: string;
  endpoint: string;
  status: number;
  durationMs: number;
  timestamp: string;
}

/**
 * Reusable API Client Layer with automatic latency measurement,
 * bearer token injection, and structured diagnostic logs.
 */
export class ApiClient {
  private request: APIRequestContext;
  private baseURL: string;
  private authToken: string | null = null;
  public callLogs: ApiCallMetric[] = [];

  constructor(request: APIRequestContext, baseURL?: string) {
    this.request = request;
    this.baseURL = baseURL || process.env.API_URL || 'http://localhost:5000';
  }

  setAuthToken(token: string): void {
    this.authToken = token;
  }

  clearAuthToken(): void {
    this.authToken = null;
  }

  private getHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...customHeaders,
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  private async execute(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    options?: { data?: any; params?: Record<string, string | number | boolean>; headers?: Record<string, string> }
  ): Promise<{ response: APIResponse; body: any; durationMs: number }> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    const headers = this.getHeaders(options?.headers);
    const start = performance.now();

    let response: APIResponse;
    const requestOptions: any = { headers, params: options?.params };
    if (options?.data !== undefined) {
      requestOptions.data = options.data;
    }

    switch (method) {
      case 'GET':
        response = await this.request.get(url, requestOptions);
        break;
      case 'POST':
        response = await this.request.post(url, requestOptions);
        break;
      case 'PUT':
        response = await this.request.put(url, requestOptions);
        break;
      case 'PATCH':
        response = await this.request.patch(url, requestOptions);
        break;
      case 'DELETE':
        response = await this.request.delete(url, requestOptions);
        break;
    }

    const durationMs = Math.round(performance.now() - start);

    let body: any = null;
    const contentType = response.headers()['content-type'] || '';
    if (contentType.includes('application/json')) {
      try {
        body = await response.json();
      } catch {
        body = await response.text();
      }
    } else {
      body = await response.text();
    }

    this.callLogs.push({
      method,
      endpoint,
      status: response.status(),
      durationMs,
      timestamp: new Date().toISOString(),
    });

    return { response, body, durationMs };
  }

  async get(endpoint: string, options?: { params?: Record<string, any>; headers?: Record<string, string> }) {
    return this.execute('GET', endpoint, options);
  }

  async post(endpoint: string, data?: any, options?: { headers?: Record<string, string> }) {
    return this.execute('POST', endpoint, { data, ...options });
  }

  async put(endpoint: string, data?: any, options?: { headers?: Record<string, string> }) {
    return this.execute('PUT', endpoint, { data, ...options });
  }

  async patch(endpoint: string, data?: any, options?: { headers?: Record<string, string> }) {
    return this.execute('PATCH', endpoint, { data, ...options });
  }

  async delete(endpoint: string, options?: { headers?: Record<string, string> }) {
    return this.execute('DELETE', endpoint, options);
  }
}
