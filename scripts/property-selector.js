#!/usr/bin/env node

/**
 * Property Selector for booking.com
 * Handles selecting a property from search results and navigating to details page
 * Uses Playwright for browser automation
 *
 * Usage:
 *   const { selectProperty } = require('./property-selector.js');
 *   const property = await selectProperty(page, results, 1);
 */

/**
 * Select a property from search results and navigate to details page
 * @param {Object} page - Playwright page object
 * @param {Array} results - Array of hotel results from search
 * @param {number} index - Index of property to select (1-based)
 * @returns {Promise<Object>} Property details object
 */
async function selectProperty(page, results, index = 1) {
  try {
    console.log(`Selecting property #${index}...`);

    // Validate results
    if (!results || results.length === 0) {
      throw new Error('No results available to select from');
    }

    if (index < 1 || index > results.length) {
      throw new Error(`Invalid index ${index}. Must be between 1 and ${results.length}`);
    }

    const selectedHotel = results[index - 1];

    // Click on property
    console.log(`  Clicking on: ${selectedHotel.name || `Property ${index}`}`);
    await clickOnProperty(page, selectedHotel);

    // Wait for details page to load
    console.log('  Waiting for property details page...');
    const loaded = await waitForPropertyDetailsPage(page);

    if (!loaded) {
      throw new Error('Failed to load property details page');
    }

    console.log('Property details page loaded');

    // Return property info
    return {
      success: true,
      index: index,
      name: selectedHotel.name || `Property ${index}`,
      url: page.url(),
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error selecting property:', error.message);
    return {
      success: false,
      error: error.message,
      index: index,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Click on a property from search results
 * @param {Object} page - Playwright page object
 * @param {Object} hotel - Hotel object with url or name
 */
async function clickOnProperty(page, hotel) {
  try {
    // If we have a URL, navigate directly
    if (hotel.url) {
      await page.goto(hotel.url, { waitUntil: 'networkidle' });
      await sleep(1000);
      console.log('  Navigated to property via URL');
      return;
    }

    // Otherwise, find and click the link by name
    if (hotel.name) {
      // Try to find a link containing the hotel name
      const linkSelector = `a:has-text("${hotel.name.substring(0, 30)}")`;
      const link = page.locator(linkSelector).first();

      if (await link.isVisible({ timeout: 3000 }).catch(() => false)) {
        await link.click();
        await sleep(1000);
        console.log('  Clicked property by name');
        return;
      }
    }

    // Fallback: click on first hotel link
    const firstHotelLink = page.locator('a[href*="/hotel/"]').first();
    await firstHotelLink.click();
    await sleep(1000);
    console.log('  Clicked first hotel link');

  } catch (error) {
    throw new Error(`Failed to click property: ${error.message}`);
  }
}

/**
 * Wait for property details page to load
 * @param {Object} page - Playwright page object
 */
async function waitForPropertyDetailsPage(page, timeout = 15000) {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    try {
      const url = page.url();

      // Check for property details URL pattern
      if (url.includes('/hotel/') && !url.includes('searchresults')) {
        // Wait for main content to load
        await page.waitForLoadState('domcontentloaded');
        return true;
      }
    } catch (error) {
      // Page not ready yet
    }

    await sleep(500);
  }

  return false;
}

/**
 * Handle property page popups (cookies, login, etc.)
 * @param {Object} page - Playwright page object
 */
async function handlePropertyPagePopups(page) {
  try {
    // Handle cookie banner
    await handleCookieBanner(page);

    // Handle login popup if appears
    await handleLoginPopup(page);

    console.log('  Popups handled');
  } catch (error) {
    console.warn('  Some popups may not have been handled');
  }
}

/**
 * Handle cookie banner on property page
 * @param {Object} page - Playwright page object
 */
async function handleCookieBanner(page) {
  try {
    const acceptBtn = page.locator('[data-testid="cookie-accept-btn"]');
    if (await acceptBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await acceptBtn.click();
      console.log('  Cookie banner accepted');
    }
  } catch (error) {
    // Cookie banner not present
  }
}

/**
 * Handle login popup if it appears
 * @param {Object} page - Playwright page object
 */
async function handleLoginPopup(page) {
  try {
    // Close login popup if it appears
    const closeBtn = page.locator('[data-testid="login-popup-close"], [aria-label="Close"]').first();
    if (await closeBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await closeBtn.click();
      console.log('  Login popup closed');
    }
  } catch (error) {
    // Login popup not present
  }
}

/**
 * Navigate directly to property details page by URL
 * @param {Object} page - Playwright page object
 * @param {string} propertyUrl - Property URL
 */
async function navigateToPropertyDetails(page, propertyUrl) {
  try {
    console.log('Navigating to property details...');

    await page.goto(propertyUrl, { waitUntil: 'networkidle' });

    // Wait for page to load
    const loaded = await waitForPropertyDetailsPage(page);

    if (!loaded) {
      throw new Error('Property details page did not load');
    }

    console.log('Property details page loaded');

    return {
      success: true,
      url: propertyUrl,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error navigating to property:', error.message);
    return {
      success: false,
      error: error.message,
      url: propertyUrl,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Go back to search results from property details
 * @param {Object} page - Playwright page object
 */
async function goBackToSearchResults(page) {
  try {
    console.log('Going back to search results...');

    await page.goBack();
    await page.waitForLoadState('networkidle');
    await sleep(1000);

    console.log('Back to search results');

    return {
      success: true,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error going back:', error.message);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Check if currently on property details page
 * @param {Object} page - Playwright page object
 */
async function isOnPropertyDetailsPage(page) {
  try {
    const url = page.url();
    return url.includes('/hotel/') && !url.includes('searchresults');
  } catch (error) {
    return false;
  }
}

/**
 * Sleep helper
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Export for use in other modules
module.exports = {
  selectProperty,
  clickOnProperty,
  waitForPropertyDetailsPage,
  handlePropertyPagePopups,
  handleCookieBanner,
  handleLoginPopup,
  navigateToPropertyDetails,
  goBackToSearchResults,
  isOnPropertyDetailsPage,
  sleep
};

// CLI mode for testing
if (require.main === module) {
  console.log('Property Selector Module');
  console.log('This module requires Playwright to be configured.');
  console.log('\nUsage:');
  console.log('  const { selectProperty } = require("./property-selector.js");');
  console.log('  const result = await selectProperty(page, results, 1);');
}
