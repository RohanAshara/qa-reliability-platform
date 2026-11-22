import { test, expect } from '@playwright/test';

test.describe('Recorded Scenario: Swag Labs Quick Smoke', () => {
  test('Verify Swag Labs Login Page loads successfully', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');
    await expect(page).toHaveTitle(/Swag Labs/);
    await expect(page.locator('#user-name')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#login-button')).toBeVisible();
  });
});
