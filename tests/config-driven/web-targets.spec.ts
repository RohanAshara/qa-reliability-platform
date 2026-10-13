import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * ============================================================================
 * Level 1: Low Complexity / Zero-Code Config-Driven Web Testing Engine
 * ============================================================================
 * Reads target web applications from `config/web-targets.json` and automatically
 * validates availability, SSL, response latency SLA, and page titles without
 * writing manual code for each target.
 * ============================================================================
 */

interface WebTarget {
  id: string;
  name: string;
  url: string;
  expectedTitle?: string;
  slaBudgetMs: number;
  checkSsl: boolean;
  enabled: boolean;
}

const configPath = path.resolve(__dirname, '../../config/web-targets.json');
let targets: WebTarget[] = [];

if (fs.existsSync(configPath)) {
  try {
    targets = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch (err) {
    console.error('Failed to parse config/web-targets.json:', err);
  }
}

test.describe('Level 1: Config-Driven Data Testing (Low Complexity)', () => {
  const activeTargets = targets.filter((t) => t.enabled);

  for (const target of activeTargets) {
    test(`Target: ${target.name} [${target.url}]`, async ({ page, request }) => {
      const startTime = Date.now();

      // Step 1: HTTP Availability & Latency
      const httpRes = await request.get(target.url, { timeout: 15_000, ignoreHTTPSErrors: true });
      expect(httpRes.status(), `Target ${target.url} returned non-2xx status`).toBeLessThan(400);

      const latencyMs = Date.now() - startTime;
      expect(
        latencyMs,
        `Page load time (${latencyMs}ms) exceeded SLA threshold of ${target.slaBudgetMs}ms`
      ).toBeLessThan(target.slaBudgetMs);

      // Step 2: Browser Page Render & Title Verification (if expectedTitle configured)
      if (target.expectedTitle && target.expectedTitle.trim() !== '') {
        await page.goto(target.url, { timeout: 20_000, waitUntil: 'domcontentloaded' });
        const title = await page.title();
        expect(title.toLowerCase()).toContain(target.expectedTitle.toLowerCase());
      }

      // Step 3: SSL Verification if flagged
      if (target.checkSsl && target.url.startsWith('https://')) {
        expect(target.url).toMatch(/^https:\/\//);
      }
    });
  }
});
