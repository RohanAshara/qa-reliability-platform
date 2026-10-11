import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.test
dotenv.config({ path: path.resolve(__dirname, '.env.test') });

/**
 * Enterprise QA Automation Platform - Playwright Configuration
 * Tuned specifically for Intel i5-1240P (12 cores) / 8GB RAM host machine.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // Sequential worker to keep memory footprint under 1GB
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 1, // 1 worker locally on 8GB RAM
  timeout: 30_000, // 30s per test

  reporter: [
    ['line'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'reports/results.xml' }],
    ['json', { outputFile: 'reports/results.json' }],
  ],

  use: {
    baseURL: process.env.BASE_URL || 'https://www.saucedemo.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true, // Headless browser to minimize RAM
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
  ],
});
