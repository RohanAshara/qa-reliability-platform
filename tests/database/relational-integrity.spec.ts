import { test, expect } from '@playwright/test';
import { DatabaseHelper } from '../../fixtures/database';

test.describe('Database Layer — Relational Integrity & Schema Constraint Audits', () => {
  let db: DatabaseHelper;

  test.beforeAll(async () => {
    db = new DatabaseHelper();
    await db.connect();
  });

  test.afterAll(async () => {
    await db.disconnect();
  });

  test('audit: zero orphaned order_items exist without a corresponding order', async () => {
    const orphans = await db.detectOrphans('order_items', 'order_id', 'orders', 'id');
    expect(orphans).toHaveLength(0);
  });

  test('audit: zero orphaned order_items exist without an active product', async () => {
    const orphans = await db.detectOrphans('order_items', 'product_id', 'products', 'id');
    expect(orphans).toHaveLength(0);
  });

  test('audit: zero orphaned orders exist without a registered user', async () => {
    const orphans = await db.detectOrphans('orders', 'user_id', 'users', 'id');
    expect(orphans).toHaveLength(0);
  });

  test('constraint enforcement: database rejects foreign key violation (non-existent user)', async () => {
    const nonExistentUserId = '00000000-0000-0000-0000-000000000000';

    let errorCaught: any = null;
    try {
      await db.execute(
        `INSERT INTO orders (user_id, status, total_amount)
         VALUES ($1, 'pending', 50.00)`,
        [nonExistentUserId]
      );
    } catch (error) {
      errorCaught = error;
    }

    expect(errorCaught).not.toBeNull();
    // PostgreSQL error code 23503: foreign_key_violation
    expect(errorCaught.code).toBe('23503');
  });

  test('constraint enforcement: database rejects check constraint violation (negative product price)', async () => {
    let errorCaught: any = null;
    try {
      await db.execute(
        `INSERT INTO products (name, price, stock_quantity)
         VALUES ('Illegal Item', -25.00, 10)`
      );
    } catch (error) {
      errorCaught = error;
    }

    expect(errorCaught).not.toBeNull();
    // PostgreSQL error code 23514: check_violation
    expect(errorCaught.code).toBe('23514');
  });

  test('constraint enforcement: database rejects null constraint violation (missing email)', async () => {
    let errorCaught: any = null;
    try {
      await db.execute(
        `INSERT INTO users (email, password_hash)
         VALUES (NULL, 'hash123')`
      );
    } catch (error) {
      errorCaught = error;
    }

    expect(errorCaught).not.toBeNull();
    // PostgreSQL error code 23502: not_null_violation
    expect(errorCaught.code).toBe('23502');
  });
});
