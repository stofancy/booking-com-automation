#!/usr/bin/env node

/**
 * Booking.com Automation Skill - Entry Point
 *
 * Automates hotel booking on booking.com from search to payment handoff.
 * All functions are ATOMIC - agent calls each stage function directly.
 *
 * Quick Start (Agent flow):
 *
 *   // 1. Start browser
 *   const browserResult = await browser.start({ profile: 'default' });
 *
 *   // 2. Execute stages in order
 *   const { searchForm } = require('./index.js');
 *   await searchForm.executeSearch(browserResult.page, { destination: 'Paris', ... });
 *
 *   // 3. Ask user, then continue
 *   const { resultsExtractor } = require('./index.js');
 *   const results = await resultsExtractor.extractResults(browserResult.page);
 *
 *   // ... continue with other stages ...
 *
 *   // 4. Clean up
 *   await browser.stop();
 */

const { chromium } = require('playwright');
const searchForm = require('./scripts/search-form.js');
const resultsExtractor = require('./scripts/results-extractor.js');
const propertySelector = require('./scripts/property-selector.js');
const roomExtractor = require('./scripts/room-extractor.js');
const rateComparison = require('./scripts/rate-comparison.js');
const roomSelection = require('./scripts/room-selection.js');
const guestDetails = require('./scripts/guest-details.js');
const paymentHandoff = require('./scripts/payment-handoff.js');

const MODULE_NAME = 'booking-com-automation';
const VERSION = '1.6.0';

/**
 * All booking stages in order
 * MUST be executed in this order - booking.com requires it
 */
const STAGES = {
  SEARCH: 'search',       // 1. Fill search form, submit
  RESULTS: 'results',     // 2. Extract search results
  PROPERTY: 'property',   // 3. Select hotel, go to details page
  ROOM: 'room',           // 4. Extract room options
  RATE: 'rate',           // 5. Compare room prices
  SELECTION: 'selection', // 6. Select room type
  GUEST: 'guest',         // 7. Fill guest information
  PAYMENT: 'payment'      // 8. Go to payment page, hand off to user
};

/**
 * Connect to OpenClaw managed browser via CDP
 *
 * @param {string} cdpUrl - CDP WebSocket URL from browser.start()
 * @returns {Promise<{browser, page, close}>}
 *
 * @example
 * const { connectBrowser } = require('./index.js');
 * const { browser, page, close } = await connectBrowser(wsUrl);
 * // use page...
 * await close();
 */
async function connectBrowser(cdpUrl) {
  if (!cdpUrl) {
    throw new Error('cdpUrl is required');
  }

  // Validate cdpUrl is local
  try {
    const url = new URL(cdpUrl);
    if (!['localhost', '127.0.0.1'].includes(url.hostname)) {
      throw new Error('cdpUrl must be localhost or 127.0.0.1');
    }
  } catch (e) {
    throw new Error(`Invalid cdpUrl: ${e.message}`);
  }

  const browser = await chromium.connectOverCDP(cdpUrl);
  const context = browser.contexts()[0] || await browser.newContext();
  const page = await context.newPage();

  return {
    browser,
    page,
    close: async () => {
      await page.close().catch(() => {});
      await browser.disconnect().catch(() => {});
    }
  };
}

/**
 * Run search on booking.com
 *
 * This is an ATOMIC function - it executes ONE stage only (search).
 * Does NOT manage browser lifecycle - caller provides the page.
 *
 * @param {Object} page - Playwright page object (from browser.start())
 * @param {Object} params - Search parameters
 * @param {string} params.destination - City name
 * @param {string} params.checkIn - Check-in date (YYYY-MM-DD)
 * @param {string} params.checkOut - Check-out date (YYYY-MM-DD)
 * @param {number} params.adults - Number of adults (default: 2)
 * @param {number} params.children - Number of children (default: 0)
 * @param {number} params.rooms - Number of rooms (default: 1)
 *
 * @returns {Promise<{success: boolean, message: string, error?: string}>}
 *
 * @example
 * const { searchForm } = require('./index.js');
 * const result = await searchForm.executeSearch(page, {
 *   destination: 'Paris',
 *   checkIn: '2026-04-01',
 *   checkOut: '2026-04-05',
 *   adults: 2
 * });
 * if (result.success) {
 *   // proceed to next stage
 * }
 */
async function run(page, params) {
  // Validate page
  if (!page || typeof page.url !== 'function') {
    return {
      success: false,
      error: 'INVALID_PAGE',
      message: 'page must be a Playwright page object from browser.start()'
    };
  }

  // Validate required params
  if (!params.destination) {
    return {
      success: false,
      error: 'MISSING_DESTINATION',
      message: 'destination is required'
    };
  }

  if (!params.checkIn || !params.checkOut) {
    return {
      success: false,
      error: 'MISSING_DATES',
      message: 'checkIn and checkOut are required (YYYY-MM-DD format)'
    };
  }

  const result = await searchForm.executeSearch(page, params);

  return {
    success: result.success,
    message: result.success
      ? `Search completed: ${params.destination}`
      : result.error,
    error: result.success ? undefined : result.error
  };
}

/**
 * Legacy run function - for backward compatibility
 *
 * Creates its own browser, executes search, and closes browser.
 * Use this only for simple single-search use cases.
 *
 * For full booking flow, use browser.start() + stage functions instead.
 *
 * @deprecated Use browser.start() + searchForm.executeSearch() instead
 */
async function runLegacy(params) {
  let browser = null;

  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    const result = await run(page, params);

    return {
      success: result.success,
      message: result.message,
      data: result.success ? { url: page.url() } : undefined,
      error: result.error
    };
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}

// Export for OpenClaw
module.exports = {
  // Main entry point
  run,

  // Legacy entry point (for backward compatibility)
  runLegacy,

  // Helper for CDP connection
  connectBrowser,

  // Stage modules (agent calls these directly)
  searchForm,
  resultsExtractor,
  propertySelector,
  roomExtractor,
  rateComparison,
  roomSelection,
  guestDetails,
  paymentHandoff,

  // Constants
  STAGES
};

// CLI mode
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args[0] === '--help' || args[0] === '-h') {
    console.log(`
Booking.com Automation Skill v${VERSION}

Usage:
  node index.js --destination "Paris" --checkin 2026-04-01 --checkout 2026-04-05

For full booking flow, use the stage functions directly:
  const { searchForm } = require('./index.js');
  const result = await searchForm.executeSearch(page, params);
`);
    return;
  }

  // Parse CLI args
  const params = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--destination' || args[i] === '-d') {
      params.destination = args[++i];
    } else if (args[i] === '--checkin' || args[i] === '-i') {
      params.checkIn = args[++i];
    } else if (args[i] === '--checkout' || args[i] === '-o') {
      params.checkOut = args[++i];
    } else if (args[i] === '--adults' || args[i] === '-a') {
      params.adults = parseInt(args[++i], 10);
    }
  }

  runLegacy(params).then(result => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.success ? 0 : 1);
  }).catch(e => {
    console.error(e.message);
    process.exit(1);
  });
}
