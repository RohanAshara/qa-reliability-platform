import { test, expect } from '@playwright/test';
import { ApiClient } from '../../clients/apiClient';
import { AuthHelper } from '../../fixtures/auth';

test.describe('API Layer — Products & Catalog Management Tests', () => {
  let api: ApiClient;
  let adminToken: string;
  let customerToken: string;

  test.beforeAll(async ({ request }) => {
    adminToken = await AuthHelper.login(request, {
      email: process.env.ADMIN_EMAIL || 'admin@qa-platform.test',
      password: process.env.ADMIN_PASSWORD || 'AdminSecret123!',
    });
    customerToken = await AuthHelper.login(request, {
      email: process.env.CUSTOMER_EMAIL || 'customer@qa-platform.test',
      password: process.env.CUSTOMER_PASSWORD || 'CustomerSecret123!',
    });
  });

  test.beforeEach(async ({ request }) => {
    api = new ApiClient(request);
  });

  test.describe('Public Endpoints (Unauthenticated)', () => {
    test('GET /api/products lists all active products', async () => {
      const { response, body, durationMs } = await api.get('/api/products');

      expect(response.status()).toBe(200);
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThanOrEqual(4);
      expect(durationMs).toBeLessThan(500); // Latency SLA
    });

    test('GET /api/products filters accurately by category', async () => {
      const { response, body } = await api.get('/api/products', {
        params: { category: 'electronics' },
      });

      expect(response.status()).toBe(200);
      expect(body.length).toBeGreaterThanOrEqual(1);
      body.forEach((p: any) => {
        expect(p.category).toBe('electronics');
      });
    });

    test('GET /api/products filters by price boundaries (minPrice & maxPrice)', async () => {
      const { response, body } = await api.get('/api/products', {
        params: { minPrice: 50, maxPrice: 100 },
      });

      expect(response.status()).toBe(200);
      body.forEach((p: any) => {
        const price = parseFloat(p.price);
        expect(price).toBeGreaterThanOrEqual(50);
        expect(price).toBeLessThanOrEqual(100);
      });
    });

    test('GET /api/products filters by search term', async () => {
      const { response, body } = await api.get('/api/products', {
        params: { search: 'Keyboard' },
      });

      expect(response.status()).toBe(200);
      expect(body.length).toBeGreaterThanOrEqual(1);
      expect(body[0].name).toContain('Keyboard');
    });

    test('GET /api/products/:id retrieves known seed product by ID', async () => {
      const seedId = 'b0000000-0000-0000-0000-000000000001';
      const { response, body } = await api.get(`/api/products/${seedId}`);

      expect(response.status()).toBe(200);
      expect(body.id).toBe(seedId);
      expect(body.name).toBe('Mechanical Keyboard Pro');
      expect(parseFloat(body.price)).toBe(99.99);
    });

    test('GET /api/products/:id returns 404 for non-existent product ID', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const { response } = await api.get(`/api/products/${nonExistentId}`);

      expect(response.status()).toBe(404);
    });
  });

  test.describe('Admin-Only Mutations & Role-Based Access Control (RBAC)', () => {
    test('admin can successfully create a new catalog product', async () => {
      api.setAuthToken(adminToken);
      const productPayload = {
        name: `Automated Test Item ${Date.now()}`,
        description: 'Created by automated QA API test',
        price: 149.99,
        stock_quantity: 45,
        category: 'electronics',
      };

      const { response, body } = await api.post('/api/products', productPayload);

      expect(response.status()).toBe(201);
      expect(body.id).toBeTruthy();
      expect(body.name).toBe(productPayload.name);
      expect(parseFloat(body.price)).toBe(149.99);
      expect(body.stock_quantity).toBe(45);
    });

    test('customer role is rejected with 403 Forbidden when creating a product', async () => {
      api.setAuthToken(customerToken);
      const { response } = await api.post('/api/products', {
        name: 'Unauthorized Item',
        price: 19.99,
        stock_quantity: 10,
      });

      expect(response.status()).toBe(403);
    });

    test('unauthenticated request is rejected with 401 Unauthorized', async () => {
      api.clearAuthToken();
      const { response } = await api.post('/api/products', {
        name: 'No Auth Item',
        price: 19.99,
      });

      expect(response.status()).toBe(401);
    });

    test('rejects product creation with negative price with 400 Bad Request', async () => {
      api.setAuthToken(adminToken);
      const { response, body } = await api.post('/api/products', {
        name: 'Negative Price Item',
        price: -10.0,
        stock_quantity: 5,
      });

      expect(response.status()).toBe(400);
      expect(body.error).toContain('non-negative');
    });

    test('admin can update product price and stock quantity', async () => {
      api.setAuthToken(adminToken);

      // Create an item first to update
      const { body: created } = await api.post('/api/products', {
        name: `Mutable Product ${Date.now()}`,
        price: 49.99,
        stock_quantity: 20,
        category: 'electronics',
      });

      const { response, body: updated } = await api.put(`/api/products/${created.id}`, {
        price: 59.99,
        stock_quantity: 35,
      });

      expect(response.status()).toBe(200);
      expect(parseFloat(updated.price)).toBe(59.99);
      expect(updated.stock_quantity).toBe(35);
    });

    test('admin can deactivate (soft delete) a product', async () => {
      api.setAuthToken(adminToken);

      const { body: created } = await api.post('/api/products', {
        name: `Deactivatable Product ${Date.now()}`,
        price: 15.0,
        stock_quantity: 10,
      });

      const { response } = await api.delete(`/api/products/${created.id}`);
      expect(response.status()).toBe(200);

      // Product should now be inactive and not returned in public catalog
      const { body: catalog } = await api.get('/api/products');
      const found = catalog.find((p: any) => p.id === created.id);
      expect(found).toBeUndefined();
    });
  });
});
