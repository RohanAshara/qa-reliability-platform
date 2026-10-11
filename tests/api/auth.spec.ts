import { test, expect } from '@playwright/test';
import { ApiClient } from '../../clients/apiClient';

test.describe('API Layer — Authentication & Authorization Contract Tests', () => {
  let api: ApiClient;

  test.beforeEach(async ({ request }) => {
    api = new ApiClient(request);
  });

  test.describe('POST /api/auth/register', () => {
    test('successfully registers a new customer with valid credentials', async () => {
      const email = `test-user-${Date.now()}@qa-platform.test`;
      const { response, body, durationMs } = await api.post('/api/auth/register', {
        email,
        password: 'SecurePassword123!',
      });

      expect(response.status()).toBe(201);
      expect(body.email).toBe(email);
      expect(body.role).toBe('customer');
      expect(body.token).toBeTruthy();
      expect(typeof body.token).toBe('string');
      expect(durationMs).toBeLessThan(1000); // Latency SLA
    });

    test('returns 409 Conflict when attempting to register duplicate email', async () => {
      const email = `duplicate-${Date.now()}@qa-platform.test`;

      // Initial registration
      await api.post('/api/auth/register', {
        email,
        password: 'SecurePassword123!',
      });

      // Attempt duplicate
      const { response, body } = await api.post('/api/auth/register', {
        email,
        password: 'AnotherPassword123!',
      });

      expect(response.status()).toBe(409);
      expect(body.error).toContain('already exists');
    });

    test('returns 400 Bad Request when password is shorter than 6 characters', async () => {
      const { response, body } = await api.post('/api/auth/register', {
        email: `short-pass-${Date.now()}@qa-platform.test`,
        password: '123',
      });

      expect(response.status()).toBe(400);
      expect(body.error).toContain('at least 6 characters');
    });

    test('returns 400 Bad Request when email is missing', async () => {
      const { response } = await api.post('/api/auth/register', {
        password: 'SecurePassword123!',
      });

      expect(response.status()).toBe(400);
    });
  });

  test.describe('POST /api/auth/login', () => {
    test('successfully logs in seeded customer and returns valid JWT', async () => {
      const { response, body } = await api.post('/api/auth/login', {
        email: process.env.CUSTOMER_EMAIL || 'customer@qa-platform.test',
        password: process.env.CUSTOMER_PASSWORD || 'CustomerSecret123!',
      });

      expect(response.status()).toBe(200);
      expect(body.token).toBeTruthy();
      expect(body.user.role).toBe('customer');
    });

    test('successfully logs in seeded admin with admin privileges', async () => {
      const { response, body } = await api.post('/api/auth/login', {
        email: process.env.ADMIN_EMAIL || 'admin@qa-platform.test',
        password: process.env.ADMIN_PASSWORD || 'AdminSecret123!',
      });

      expect(response.status()).toBe(200);
      expect(body.token).toBeTruthy();
      expect(body.user.role).toBe('admin');
    });

    test('returns 401 Unauthorized for incorrect password', async () => {
      const { response } = await api.post('/api/auth/login', {
        email: 'customer@qa-platform.test',
        password: 'WrongPassword999!',
      });

      expect(response.status()).toBe(401);
    });

    test('returns 401 Unauthorized for non-existent email', async () => {
      const { response } = await api.post('/api/auth/login', {
        email: 'ghost-user@does-not-exist.test',
        password: 'SomePassword123!',
      });

      expect(response.status()).toBe(401);
    });
  });

  test.describe('JWT Token Security & Boundary Validation', () => {
    test('returns 401 when accessing protected route with tampered token', async () => {
      api.setAuthToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tampered.signature');
      const { response } = await api.get('/api/orders');

      expect(response.status()).toBe(401);
    });

    test('returns 401 when accessing protected route without token', async () => {
      api.clearAuthToken();
      const { response } = await api.get('/api/orders');

      expect(response.status()).toBe(401);
    });
  });
});
