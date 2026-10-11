import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { CartPage } from '../../pages/CartPage';
import { CheckoutPage } from '../../pages/CheckoutPage';

test.describe('UI Layer — End-to-End E-Commerce Purchasing Journey', () => {
  test('complete purchase workflow: Login → Sort → Add to Cart → Modify Cart → Checkout → Confirmation', async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    // 1. Authenticate
    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
    await expect(page).toHaveURL(/.*inventory\.html/);

    // 2. Sort Catalog by Price (High to Low)
    await inventoryPage.sortBy('hilo');
    const firstItem = await inventoryPage.getFirstItemName();
    expect(firstItem).toBe('Sauce Labs Fleece Jacket');

    // 3. Add 2 items to shopping cart
    await inventoryPage.addItemToCartByName('Sauce Labs Fleece Jacket');
    await inventoryPage.addItemToCartByName('Sauce Labs Backpack');

    // 4. Verify cart badge counter
    const badgeCount = await inventoryPage.getCartCount();
    expect(badgeCount).toBe(2);

    // 5. Navigate to Cart & Modify Items
    await inventoryPage.goToCart();
    await expect(cartPage.cartItemNames).toHaveCount(2);

    // Remove one item from cart
    await cartPage.removeItemByName('Sauce Labs Backpack');
    await expect(cartPage.cartItemNames).toHaveCount(1);

    // 6. Proceed to Multi-Step Checkout
    await cartPage.proceedToCheckout();

    // 7. Fill Shipping / Customer Info
    await checkoutPage.fillShippingInfo('Jane', 'Tester', '94016');

    // 8. Verify Order Summary & Finalize
    await expect(checkoutPage.totalLabel).toBeVisible();
    await checkoutPage.finishCheckout();

    // 9. Assert Final Confirmation
    const confirmationText = await checkoutPage.getConfirmationText();
    expect(confirmationText).toBe('Thank you for your order!');
    await expect(checkoutPage.backHomeButton).toBeVisible();
  });
});
