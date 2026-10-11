import { test, expect } from '@playwright/test';
import { DatabaseHelper } from '../../fixtures/database';
import { ApiClient } from '../../clients/apiClient';
import { AuthHelper } from '../../fixtures/auth';

test.describe('Database Layer — Business Invariants & Audit Log Validations', () => {
  let db: DatabaseHelper;
  let api: ApiClient;
  let customerToken: string;

  const targetProductId = 'b0000000-0000-0000-0000-000000000003'; // Noise-Cancelling Headphones

  test.beforeAll(async () => {
    db = new DatabaseHelper();
    await db.connect();
  });

  test.afterAll(async () => {
    await db.disconnect();
  });

  test.beforeEach(async ({ request }) => {
    api = new ApiClient(request);
    const { token } = await AuthHelper.register(request, {
      email: `invariants-${Date.now()}@qa-platform.test`,
      password: 'CustomerPass123!',
    });
    customerToken = token;
    api.setAuthToken(customerToken);
  });

  test('invariant: product stock decrements atomically in PostgreSQL upon order creation', async () => {
    // 1. Fetch current stock baseline directly from database
    const initialProduct = await db.getOne<{ stock_quantity: number }>(
      'SELECT stock_quantity FROM products WHERE id = $1',
      [targetProductId]
    );
    expect(initialProduct).not.toBeNull();
    const baselineStock = initialProduct!.stock_quantity;

    // 2. Place an order for 2 units
    const orderQty = 2;
    const { response, body: order } = await api.post('/api/orders', {
      items: [{ productId: targetProductId, quantity: orderQty }],
    });
    expect(response.status()).toBe(201);

    // 3. Query PostgreSQL directly to verify invariant
    const updatedProduct = await db.getOne<{ stock_quantity: number }>(
      'SELECT stock_quantity FROM products WHERE id = $1',
      [targetProductId]
    );
    expect(updatedProduct!.stock_quantity).toBe(baselineStock - orderQty);

    // Clean up
    await db.cleanup('orders', 'id', order.id);
    // Restore baseline stock
    await db.execute(
      'UPDATE products SET stock_quantity = $1 WHERE id = $2',
      [baselineStock, targetProductId]
    );
  });

  test('invariant: product stock is restored in PostgreSQL upon order cancellation', async () => {
    // 1. Baseline stock
    const initialProduct = await db.getOne<{ stock_quantity: number }>(
      'SELECT stock_quantity FROM products WHERE id = $1',
      [targetProductId]
    );
    const baselineStock = initialProduct!.stock_quantity;

    // 2. Place order for 3 units
    const { body: order } = await api.post('/api/orders', {
      items: [{ productId: targetProductId, quantity: 3 }],
    });

    // 3. Cancel order via API
    const { response: cancelRes } = await api.patch(`/api/orders/${order.id}/cancel`);
    expect(cancelRes.status()).toBe(200);

    // 4. Query PostgreSQL directly to verify stock was restored
    const restoredProduct = await db.getOne<{ stock_quantity: number }>(
      'SELECT stock_quantity FROM products WHERE id = $1',
      [targetProductId]
    );
    expect(restoredProduct!.stock_quantity).toBe(baselineStock);

    // Clean up
    await db.cleanup('orders', 'id', order.id);
  });

  test('invariant: audit logs in PostgreSQL record immutable trace for order lifecycle', async () => {
    // 1. Place order
    const { body: order } = await api.post('/api/orders', {
      items: [{ productId: targetProductId, quantity: 1 }],
    });

    // 2. Cancel order
    await api.patch(`/api/orders/${order.id}/cancel`);

    // 3. Query PostgreSQL audit_logs directly
    const logs = await db.query<{
      action: string;
      resource_type: string;
      resource_id: string;
    }>(
      'SELECT action, resource_type, resource_id FROM audit_logs WHERE resource_id = $1 ORDER BY created_at ASC',
      [order.id]
    );

    expect(logs).toHaveLength(2);
    expect(logs[0].action).toBe('order_created');
    expect(logs[0].resource_type).toBe('order');
    expect(logs[0].resource_id).toBe(order.id);

    expect(logs[1].action).toBe('order_cancelled');
    expect(logs[1].resource_type).toBe('order');
    expect(logs[1].resource_id).toBe(order.id);

    // Clean up
    await db.cleanup('orders', 'id', order.id);
  });
});
