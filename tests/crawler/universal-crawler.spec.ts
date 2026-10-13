import { test, expect } from '@playwright/test';
const { auditUrl } = require('../../crawler/crawlerService');

/**
 * ============================================================================
 * Level 2: Universal Automated Health & Broken Link Crawler Engine
 * ============================================================================
 */
test.describe('Level 2: Universal Health & Broken Link Crawler Engine', () => {
  const targetUrl = process.env.CRAWLER_TARGET_URL || 'https://www.saucedemo.com';

  test(`Deep Diagnostic Audit: ${targetUrl}`, async () => {
    test.setTimeout(45_000);

    const report = await auditUrl(targetUrl, { maxLinksToCheck: 15, slaMs: 4000 });

    console.log(`\n[Crawler Audit] Target: ${report.url}`);
    console.log(`[Crawler Audit] Title: ${report.title}`);
    console.log(`[Crawler Audit] Load Time: ${report.durationMs}ms (SLA: ${report.slaBudgetMs}ms)`);
    console.log(`[Crawler Audit] Links Scanned: ${report.metrics.totalLinksScanned}`);
    console.log(`[Crawler Audit] Broken Links: ${report.metrics.brokenLinksCount}`);
    console.log(`[Crawler Audit] Console Errors: ${report.metrics.consoleErrorsCount}`);

    expect(report.loadError, `Page failed to load: ${report.loadError}`).toBeNull();
    expect(report.httpStatus).toBeLessThan(400);
    expect(report.brokenLinks.length, `Detected broken links on ${targetUrl}`).toBe(0);
  });
});
