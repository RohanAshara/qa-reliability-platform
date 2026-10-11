import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';

test.describe('UI Layer — Authentication Workflows & Boundary Validations', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('successful authentication navigates to inventory catalog', async ({ page }) => {
    await loginPage.login('standard_user', 'secret_sauce');
    await expect(page).toHaveURL(/.*inventory\.html/);
    await expect(page.locator('[data-test="title"]')).toHaveText('Products');
  });

  test('locked out user account displays appropriate error notification', async () => {
    await loginPage.login('locked_out_user', 'secret_sauce');
    const errorMsg = await loginPage.getErrorMessage();
    expect(errorMsg).toContain('Sorry, this user has been locked out');
  });

  test('invalid password displays authentication error', async () => {
    await loginPage.login('standard_user', 'wrong_password_123');
    const errorMsg = await loginPage.getErrorMessage();
    expect(errorMsg).toContain('Username and password do not match');
  });

  test('empty credentials submission validates required fields', async () => {
    await loginPage.login();
    const errorMsg = await loginPage.getErrorMessage();
    expect(errorMsg).toContain('Username is required');
  });

  test('user can log out cleanly through the burger menu', async ({ page }) => {
    await loginPage.login('standard_user', 'secret_sauce');
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.logout();
    await expect(loginPage.loginButton).toBeVisible();
  });
});
