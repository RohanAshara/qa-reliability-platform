import { APIRequestContext } from '@playwright/test';
import { ApiClient } from '../clients/apiClient';

export interface UserSession {
  userId: string;
  email: string;
  token: string;
  role: 'admin' | 'customer';
}

/**
 * Authentication fixture to handle user registration, logins,
 * and token caching across test suites.
 */
export class AuthHelper {
  private static cachedTokens: Map<string, string> = new Map();

  static async login(
    request: APIRequestContext,
    credentials: { email: string; password: string }
  ): Promise<string> {
    const cacheKey = credentials.email;
    if (this.cachedTokens.has(cacheKey)) {
      return this.cachedTokens.get(cacheKey)!;
    }

    const client = new ApiClient(request);
    const { response, body } = await client.post('/api/auth/login', credentials);

    if (response.status() !== 200 || !body.token) {
      throw new Error(
        `[AuthHelper] Failed to login for ${credentials.email}. Status: ${response.status()}, Response: ${JSON.stringify(body)}`
      );
    }

    this.cachedTokens.set(cacheKey, body.token);
    return body.token;
  }

  static async register(
    request: APIRequestContext,
    user: { email: string; password: string; role?: string }
  ): Promise<{ token: string; id: string }> {
    const client = new ApiClient(request);
    const { response, body } = await client.post('/api/auth/register', user);

    if (response.status() !== 201) {
      throw new Error(
        `[AuthHelper] Registration failed for ${user.email}. Status: ${response.status()}, Response: ${JSON.stringify(body)}`
      );
    }

    return { token: body.token, id: body.id };
  }

  static clearCache(): void {
    this.cachedTokens.clear();
  }
}
