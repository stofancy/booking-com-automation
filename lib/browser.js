#!/usr/bin/env node

/**
 * Browser Automation Layer - Playwright Wrapper
 *
 * Provides a unified interface for browser automation using Playwright.
 * Supports both headless and headed modes.
 *
 * Usage:
 *   const { launch, newPage } = require('./lib/browser.js');
 *   const page = await newPage();
 *   await page.goto('https://booking.com');
 */

const { chromium } = require('playwright');

/**
 * Browser configuration
 */
const DEFAULT_OPTIONS = {
  headless: false,
  slowMo: 100,
  timeout: 30000,
  viewport: { width: 1280, height: 720 }
};

let browser = null;
let context = null;

/**
 * Launch browser with optional configuration
 * @param {Object} options - Browser launch options
 * @returns {Promise<Object>} Browser instance
 */
async function launch(options = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };

  browser = await chromium.launch({
    headless: config.headless,
    slowMo: config.slowMo,
    args: ['--disable-blink-features=AutomationControlled']
  });

  return browser;
}

/**
 * Create a new page/context
 * @param {Object} options - Page options
 * @returns {Promise<Object>} Page instance
 */
async function newPage(options = {}) {
  if (!browser) {
    await launch();
  }

  context = await browser.newPage({
    viewport: options.viewport || DEFAULT_OPTIONS.viewport,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  return context;
}

/**
 * Get existing browser instance
 * @returns {Object} Browser instance
 */
function getBrowser() {
  return browser;
}

/**
 * Close browser
 * @returns {Promise<void>}
 */
async function close() {
  if (browser) {
    await browser.close();
    browser = null;
    context = null;
  }
}

/**
 * Navigate to URL
 * @param {Object} page - Playwright page
 * @param {string} url - Target URL
 * @returns {Promise<void>}
 */
async function navigate(page, url) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
}

/**
 * Wait for element to be visible
 * @param {Object} page - Playwright page
 * @param {string} selector - CSS selector
 * @param {number} timeout - Timeout in ms
 * @returns {Promise<Object>} Element handle
 */
async function waitFor(page, selector, timeout = 30000) {
  return await page.waitForSelector(selector, { state: 'visible', timeout });
}

/**
 * Click element
 * @param {Object} page - Playwright page
 * @param {string} selector - CSS selector or test ID
 * @returns {Promise<void>}
 */
async function click(page, selector) {
  // Handle test ID selector
  if (selector.includes('data-testid=')) {
    const testId = selector.match(/\[data-testid="([^"]+)"\]/)?.[1];
    if (testId) {
      await page.getByTestId(testId).click();
      return;
    }
  }

  // Handle role-based selector
  if (selector.includes('button')) {
    const match = selector.match(/getByRole\(['"]button['"]/);
  }

  await page.click(selector);
}

/**
 * Fill input field
 * @param {Object} page - Playwright page
 * @param {string} selector - CSS selector
 * @param {string} text - Text to type
 * @returns {Promise<void>}
 */
async function fill(page, selector, text) {
  await page.fill(selector, text);
}

/**
 * Get page content
 * @param {Object} page - Playwright page
 * @returns {Promise<string>} HTML content
 */
async function getContent(page) {
  return await page.content();
}

/**
 * Take screenshot
 * @param {Object} page - Playwright page
 * @param {string} path - Output path
 * @returns {Promise<void>}
 */
async function screenshot(page, path) {
  await page.screenshot({ path, fullPage: true });
}

/**
 * Get accessibility snapshot
 * @param {Object} page - Playwright page
 * @returns {Promise<Object>} Accessibility tree
 */
async function getSnapshot(page) {
  return await page.accessibility.snapshot();
}

module.exports = {
  launch,
  newPage,
  getBrowser,
  close,
  navigate,
  waitFor,
  click,
  fill,
  getContent,
  screenshot,
  getSnapshot
};
