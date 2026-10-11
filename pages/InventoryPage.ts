import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for Product Catalog & Inventory View.
 */
export class InventoryPage {
  readonly page: Page;
  readonly inventoryItems: Locator;
  readonly sortDropdown: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;
  readonly menuButton: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.inventoryItems = page.locator('[data-test="inventory-item"]');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    this.menuButton = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.locator('#logout_sidebar_link');
  }

  async addItemToCartByName(name: string): Promise<void> {
    const item = this.inventoryItems.filter({ hasText: name });
    await item.locator('button', { hasText: 'Add to cart' }).click();
  }

  async addFirstNItems(count: number): Promise<void> {
    for (let i = 0; i < count; i++) {
      await this.inventoryItems
        .nth(i)
        .locator('button', { hasText: 'Add to cart' })
        .click();
    }
  }

  async getCartCount(): Promise<number> {
    if (await this.cartBadge.isVisible()) {
      const text = await this.cartBadge.textContent();
      return parseInt(text || '0', 10);
    }
    return 0;
  }

  async sortBy(option: 'az' | 'za' | 'lohi' | 'hilo'): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  async getFirstItemName(): Promise<string> {
    return (
      (await this.inventoryItems
        .first()
        .locator('[data-test="inventory-item-name"]')
        .textContent()) || ''
    );
  }

  async goToCart(): Promise<void> {
    await this.cartLink.click();
    await this.page.waitForURL(/.*cart\.html/);
  }

  async logout(): Promise<void> {
    await this.menuButton.click();
    await this.logoutLink.waitFor({ state: 'visible' });
    await this.logoutLink.click();
    await this.page.waitForURL(/.*saucedemo\.com\/?$/);
  }
}
