const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

/**
 * ============================================================================
 * Level 2: Universal Automated Health & Broken Link Crawler Engine
 * ============================================================================
 * Crawls any given target URL and runs deep diagnostic audits:
 *   - Page load SLA and TTFB
 *   - Broken links scan (404 / 500 detection across all anchor tags)
 *   - Uncaught JavaScript runtime console errors
 *   - Failed network requests
 *   - High-resolution visual snapshot capture
 * ============================================================================
 */
async function auditUrl(targetUrl, options = { maxLinksToCheck: 25, slaMs: 3000 }) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 QA-Platform-Crawler/1.0',
  });
  const page = await context.newPage();

  const consoleErrors = [];
  const networkFailures = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push({
        text: msg.text(),
        location: msg.location().url || 'inline',
      });
    }
  });

  page.on('requestfailed', (req) => {
    networkFailures.push({
      url: req.url(),
      failure: req.failure() ? req.failure().errorText : 'Network request dropped',
    });
  });

  const startTime = Date.now();
  let pageTitle = '';
  let httpStatus = 200;
  let screenshotBase64 = null;
  let loadError = null;

  try {
    const response = await page.goto(targetUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 25000,
    });
    httpStatus = response ? response.status() : 200;
    pageTitle = await page.title();

    // Capture screenshot as base64
    const buffer = await page.screenshot({ fullPage: false });
    screenshotBase64 = buffer.toString('base64');
  } catch (err) {
    loadError = err.message;
  }

  const durationMs = Date.now() - startTime;

  // Scan anchor tags
  const linksOnPage = [];
  if (!loadError) {
    try {
      const rawLinks = await page.$$eval('a', (anchors) =>
        anchors
          .map((a) => ({
            href: a.href,
            text: (a.innerText || a.textContent || '').trim().slice(0, 50),
          }))
          .filter((l) => l.href && l.href.startsWith('http'))
      );

      // De-duplicate links
      const seen = new Set();
      for (const link of rawLinks) {
        if (!seen.has(link.href) && linksOnPage.length < options.maxLinksToCheck) {
          seen.add(link.href);
          linksOnPage.push(link);
        }
      }
    } catch {}
  }

  // Check extracted links for broken URLs
  const linkAuditResults = [];
  for (const item of linksOnPage) {
    const reqStart = Date.now();
    try {
      const resp = await context.request.get(item.href, {
        timeout: 8000,
        ignoreHTTPSErrors: true,
      });
      linkAuditResults.push({
        href: item.href,
        text: item.text || 'Link',
        status: resp.status(),
        isBroken: resp.status() >= 400,
        durationMs: Date.now() - reqStart,
      });
    } catch (e) {
      linkAuditResults.push({
        href: item.href,
        text: item.text || 'Link',
        status: 0,
        isBroken: true,
        error: e.message,
        durationMs: Date.now() - reqStart,
      });
    }
  }

  await browser.close();

  const brokenLinks = linkAuditResults.filter((l) => l.isBroken);
  const slaPassed = durationMs <= options.slaMs;
  const overallHealthy = !loadError && brokenLinks.length === 0 && consoleErrors.length === 0;

  return {
    url: targetUrl,
    title: pageTitle,
    httpStatus,
    durationMs,
    slaBudgetMs: options.slaMs,
    slaPassed,
    loadError,
    overallHealthy,
    metrics: {
      totalLinksScanned: linkAuditResults.length,
      brokenLinksCount: brokenLinks.length,
      consoleErrorsCount: consoleErrors.length,
      networkFailuresCount: networkFailures.length,
    },
    brokenLinks,
    allLinks: linkAuditResults,
    consoleErrors,
    networkFailures,
    screenshotBase64,
    auditedAt: new Date().toISOString(),
  };
}

module.exports = { auditUrl };
