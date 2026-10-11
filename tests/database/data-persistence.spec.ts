import { test, expect } from '@playwright/test';
import { DatabaseHelper } from '../../fixtures/database';
import { ApiClient } from '../../clients/apiClient';
import { AuthHelper } from '../../fixtures/auth';

test.describe('Database Layer — Data Persistence & State Consistency Tests', () => {
  let db: DatabaseHelper;
  let api: ApiClient;
  let customerToken: string;

  const seedKeyboardId = 'b0000000-0000-0000-0000-000000000001';
  const seedMouseId = 'b0000000-0000-0000-0000-000000000002';

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
      email: `persistence-${Date.now()}@qa-platform.test`,
      password: 'CustomerPass123!',
    });
    customerToken = token;
    api.setAuthToken(customerToken);
  });

  test('order state in PostgreSQL directly matches API response payload', async () => {
    // 1. Create order via API
    const { body: apiOrder } = await api.post('/api/orders', {
      items: [
        { productId: seedKeyboardId, quantity: 1 },
        { productId: seedMouseId, quantity: 2 },
      ],
    });

    expect(apiOrder.id).toBeTruthy();

    // 2. Query PostgreSQL directly to verify persistence
    const dbOrder = await db.getOne<{
      id: string;
      status: string;
      total_amount: string;
      user_id: string;
    }>('SELECT id, status, total_amount, user_id FROM orders WHERE id = $1', [
      apiOrder.id,
    ]);

    expect(dbOrder).not.toBeNull();
    expect(dbOrder!.id).toBe(apiOrder.id);
    expect(dbOrder!.status).toBe(apiOrder.status);
    expect(parseFloat(dbOrder!.total_amount)).toBeCloseTo(
      parseFloat(apiOrder.total_amount),
      2
    );

    // 3. Verify order items were persisted in order_items table
    const dbItems = await db.query<{
      id: string;
      product_id: string;
      quantity: number;
      unit_price: string;
    }>('SELECT * FROM order_items WHERE order_id = $1 ORDER BY quantity ASC', [
      apiOrder.id,
    ]);

    expect(dbItems).toHaveLength(2);
    expect(dbItems[0].product_id).toBe(seedKeyboardId);
    expect(dbItems[0].quantity).toBe(1);
    expect(parseFloat(dbItems[0].unit_price)).toBeCloseTo(99.99, 2);

    expect(dbItems[1].product_id).toBe(seedMouseId);
    expect(dbItems[1].quantity).toBe(2);
    expect(parseFloat(dbItems[1].unit_price)).toBeCloseTo(59.99, 2);

    // 4. Teardown test record via DatabaseHelper cleanup
    const deletedCount = await db.cleanup('orders', 'id', apiOrder.id);
    expect(deletedCount).toBe(1);

    // Confirm cascading delete removed order_items as well
    const remainingItems = await db.query(
      'SELECT id FROM order_items WHERE order_id = $1',
      [apiOrder.id]
    );
    expect(remainingItems).toHaveLength(0);
  });

  test('direct SQL user count matches registered users', async () => {
    const beforeCount = await db.getRowCount('users');

    // Register a new user
    await api.post('/api/auth/register', {
      email: `counter-${Date.now()}@qa-platform.test`,
      password: 'SecurePassword123!',
    });

    const afterCount = await db.getRowCount('users');
    expect(afterCount).toBe(beforeCount + 1);
  });
});
