import { test, expect } from '@playwright/test';
import { ApiClient } from '../../clients/apiClient';
import { AuthHelper } from '../../fixtures/auth';

test.describe('API Layer — Orders Lifecycle & Transactional Boundary Tests', () => {
  let api: ApiClient;
  let customerToken: string;

  const seedKeyboardId = 'b0000000-0000-0000-0000-000000000001'; // Price: 99.99
  const seedMouseId = 'b0000000-0000-0000-0000-000000000002'; // Price: 59.99

  test.beforeEach(async ({ request }) => {
    api = new ApiClient(request);
    // Dynamic customer registration to ensure clean order state per test
    const { token } = await AuthHelper.register(request, {
      email: `customer-${Date.now()}-${Math.floor(Math.random() * 1000)}@qa-platform.test`,
      password: 'CustomerPass123!',
    });
    customerToken = token;
    api.setAuthToken(customerToken);
  });

  test('successfully places an order with multiple items and verifies total calculation', async () => {
    const orderPayload = {
      items: [
        { productId: seedKeyboardId, quantity: 1 },
        { productId: seedMouseId, quantity: 2 },
      ],
    };

    const { response, body, durationMs } = await api.post('/api/orders', orderPayload);

    expect(response.status()).toBe(201);
    expect(body.id).toBeTruthy();
    expect(body.status).toBe('pending');
    expect(body.items).toHaveLength(2);

    // 99.99 * 1 + 59.99 * 2 = 219.97
    expect(parseFloat(body.total_amount)).toBeCloseTo(219.97, 2);
    expect(durationMs).toBeLessThan(1000); // Latency SLA
  });

  test('returns 400 Bad Request when ordering more than available stock', async () => {
    const { response, body } = await api.post('/api/orders', {
      items: [{ productId: seedKeyboardId, quantity: 9999 }], // Exceeds available stock
    });

    expect(response.status()).toBe(400);
    expect(body.error).toContain('Insufficient stock');
  });

  test('returns 400 Bad Request when order items list is empty', async () => {
    const { response, body } = await api.post('/api/orders', {
      items: [],
    });

    expect(response.status()).toBe(400);
    expect(body.error).toContain('at least one item');
  });

  test('returns 400 Bad Request when item quantity is zero or negative', async () => {
    const { response } = await api.post('/api/orders', {
      items: [{ productId: seedKeyboardId, quantity: -1 }],
    });

    expect(response.status()).toBe(400);
  });

  test('customer can retrieve their order history with nested order items', async () => {
    // 1. Create order
    await api.post('/api/orders', {
      items: [{ productId: seedKeyboardId, quantity: 1 }],
    });

    // 2. Fetch order list
    const { response, body } = await api.get('/api/orders');

    expect(response.status()).toBe(200);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(1);
    expect(body[0].items).toHaveLength(1);
    expect(body[0].items[0].product_id).toBe(seedKeyboardId);
  });

  test('customer can cancel a pending order', async () => {
    // 1. Create order
    const { body: order } = await api.post('/api/orders', {
      items: [{ productId: seedMouseId, quantity: 1 }],
    });

    // 2. Cancel order
    const { response, body: cancelled } = await api.patch(`/api/orders/${order.id}/cancel`);

    expect(response.status()).toBe(200);
    expect(cancelled.status).toBe('cancelled');

    // 3. Attempting to cancel already cancelled order should fail
    const { response: reCancelRes } = await api.patch(`/api/orders/${order.id}/cancel`);
    expect(reCancelRes.status()).toBe(400);
  });
});
