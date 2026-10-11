import { test, expect } from '@playwright/test';
import { DatabaseHelper } from '../../fixtures/database';
import { ApiClient } from '../../clients/apiClient';

test.describe('Platform Foundation Smoke Verification', () => {
  let db: DatabaseHelper;

  test.beforeAll(async () => {
    db = new DatabaseHelper();
    await db.connect();
  });

  test.afterAll(async () => {
    await db.disconnect();
  });

  test('Database Connectivity & Seed Verification @smoke', async () => {
    const isAlive = await db.ping();
    expect(isAlive).toBe(true);

    const productCount = await db.getRowCount('products');
    expect(productCount).toBeGreaterThanOrEqual(4);

    const userCount = await db.getRowCount('users');
    expect(userCount).toBeGreaterThanOrEqual(2);

    // Verify query metric tracking
    expect(db.queryLogs.length).toBeGreaterThan(0);
  });

  test('Target REST API Health & Public Catalog @smoke', async ({ request }) => {
    const api = new ApiClient(request);

    // 1. Check /health
    const healthRes = await api.get('/health');
    expect(healthRes.response.status()).toBe(200);
    expect(healthRes.body.status).toBe('healthy');
    expect(healthRes.body.database).toBe('connected');

    // 2. Check /api/products
    const prodRes = await api.get('/api/products');
    expect(prodRes.response.status()).toBe(200);
    expect(Array.isArray(prodRes.body)).toBe(true);
    expect(prodRes.body.length).toBeGreaterThanOrEqual(4);

    // Verify latency logging
    expect(prodRes.durationMs).toBeLessThan(2000);
    expect(api.callLogs.length).toBe(2);
  });

  test('Playwright Headless Browser Smoke Test @smoke', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
    await expect(page).toHaveTitle(/Swag Labs/);
    const loginButton = page.locator('[data-test="login-button"]');
    await expect(loginButton).toBeVisible();
  });
});
