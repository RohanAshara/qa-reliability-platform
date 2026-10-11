import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for the Shopping Cart View.
 */
export class CartPage {
  readonly page: Page;
  readonly cartItemNames: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartItemNames = page.locator('[data-test="inventory-item-name"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
  }

  async getItemCount(): Promise<number> {
    return this.cartItemNames.count();
  }

  async removeItemByName(name: string): Promise<void> {
    // Generate data-test slug e.g. "Sauce Labs Backpack" -> "remove-sauce-labs-backpack"
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const specificRemoveBtn = this.page.locator(`[data-test="remove-${slug}"]`);

    if (await specificRemoveBtn.isVisible()) {
      await specificRemoveBtn.click();
    } else {
      await this.page
        .locator('div')
        .filter({ hasText: name })
        .getByRole('button', { name: 'Remove' })
        .first()
        .click();
    }
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
    await this.page.waitForURL(/.*checkout-step-one\.html/);
  }
}
