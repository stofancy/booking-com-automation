#!/usr/bin/env node

/**
 * Booking.com Automation Skill - Entry Point
 *
 * A skill for automating hotel booking on booking.com from search to payment.
 * Uses Playwright for browser automation.
 *
 * Usage:
 *   const { run } = require('./index.js');
 *   const result = await run({
 *     destination: 'Paris',
 *     checkIn: '2026-03-15',
 *     checkOut: '2026-03-20',
 *     adults: 2,
 *     children: 0,
 *     rooms: 1
 *   });
 */

const { chromium } = require('playwright');
const searchForm = require('./scripts/search-form.js');

const MODULE_NAME = 'booking-com-automation';
const VERSION = '1.1.0';

/**
 * Main run function - OpenClaw skill entry point
 * @param {Object} params - Parameters
 * @param {string} params.destination - Hotel destination (city name)
 * @param {string} params.checkIn - Check-in date (YYYY-MM-DD)
 * @param {string} params.checkOut - Check-out date (YYYY-MM-DD)
 * @param {number} params.adults - Number of adults (default: 2)
 * @param {number} params.children - Number of children (default: 0)
 * @param {number} params.rooms - Number of rooms (default: 1)
 * @param {Object} params.page - Playwright page object (optional, for external browser)
 * @param {boolean} params.headless - Run in headless mode (default: true)
 * @returns {Object} Standardized result object
 */
async function run(params) {
  const {
    destination,
    checkIn,
    checkOut,
    adults = 2,
    children = 0,
    rooms = 1,
    page: externalPage,
    headless = true
  } = params;

  // Validate required parameters
  if (!destination) {
    return {
      success: false,
      error: 'Missing required parameter: destination',
      message: 'Please provide a destination city'
    };
  }

  if (!checkIn || !checkOut) {
    return {
      success: false,
      error: 'Missing required parameters: checkIn and checkOut',
      message: 'Please provide check-in and check-out dates (YYYY-MM-DD format)'
    };
  }

  let browser = null;
  let page = externalPage;
  let shouldCloseBrowser = false;

  try {
    // Build search params
    const searchParams = {
      destination,
      checkIn,
      checkOut,
      adults,
      children,
      rooms
    };

    // If no external page provided, launch browser
    if (!page) {
      browser = await chromium.launch({ headless });
      page = await browser.newPage();
      shouldCloseBrowser = true;
    }

    // Execute search
    const searchResult = await searchForm.executeSearch(page, searchParams);

    if (!searchResult.success) {
      return {
        success: false,
        error: 'SearchFailed',
        message: searchResult.error || 'Failed to execute search',
        data: searchParams
      };
    }

    // Return success with current URL (on search results page)
    return {
      success: true,
      message: `Search completed: ${destination} (${checkIn} to ${checkOut})`,
      data: {
        searchParams,
        url: page.url(),
        page
      }
    };

  } catch (error) {
    return {
      success: false,
      error: error.name || 'Error',
      message: error.message
    };
  } finally {
    // Close browser if we launched it
    if (shouldCloseBrowser && browser) {
      await browser.close();
    }
  }
}

/**
 * Get skill metadata
 */
function getMetadata() {
  return {
    name: MODULE_NAME,
    version: VERSION,
    description: 'Automate hotel booking on booking.com from search to payment',
    parameters: {
      destination: { type: 'string', required: true, description: 'City or hotel name' },
      checkIn: { type: 'string', required: true, description: 'Check-in date (YYYY-MM-DD)' },
      checkOut: { type: 'string', required: true, description: 'Check-out date (YYYY-MM-DD)' },
      adults: { type: 'number', required: false, default: 2, description: 'Number of adults' },
      children: { type: 'number', required: false, default: 0, description: 'Number of children' },
      rooms: { type: 'number', required: false, default: 1, description: 'Number of rooms' },
      headless: { type: 'boolean', required: false, default: true, description: 'Run browser headless' }
    },
    returns: {
      success: 'boolean',
      message: 'string',
      data: 'object with searchParams, url, and page object'
    }
  };
}

/**
 * CLI mode
 */
function cli() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
Booking.com Automation Skill v${VERSION}

Usage:
  node index.js --destination "Paris" --checkin 2026-03-15 --checkout 2026-03-20
  node index.js --metadata

As a module:
  const { run } = require('./index.js');
  const result = await run({
    destination: 'Paris',
    checkIn: '2026-03-15',
    checkOut: '2026-03-20',
    adults: 2
  });
`);
    return;
  }

  if (args[0] === '--metadata' || args[0] === '-m') {
    console.log(JSON.stringify(getMetadata(), null, 2));
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
    } else if (args[i] === '--children' || args[i] === '-c') {
      params.children = parseInt(args[++i], 10);
    } else if (args[i] === '--rooms' || args[i] === '-r') {
      params.rooms = parseInt(args[++i], 10);
    } else if (args[i] === '--headless') {
      params.headless = args[++i] !== 'false';
    }
  }

  console.log('Running search with params:', params);
  console.log('='.repeat(60));

  run(params).then(result => {
    console.log('\nResult:');
    console.log(JSON.stringify(result, null, 2));

    if (!result.success) {
      process.exit(1);
    }
  }).catch(error => {
    console.error('Error:', error.message);
    process.exit(1);
  });
}

// Export for OpenClaw
module.exports = {
  run,
  getMetadata,
  searchForm
};

// CLI entry point
if (require.main === module) {
  cli();
}
