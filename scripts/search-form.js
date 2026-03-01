#!/usr/bin/env node

/**
 * Search Form Automation for booking.com
 * Automates filling and submitting the hotel search form
 * 
 * Usage: 
 *   const { fillSearchForm, submitSearch } = require('./search-form.js');
 *   await fillSearchForm(browser, searchParams);
 *   await submitSearch(browser);
 */

const { execSync } = require('child_process');

/**
 * Browser automation selectors for booking.com
 * These may need to be updated when booking.com changes their UI
 */
const SELECTORS = {
  // Homepage
  destinationInput: 'input[name="ss"]',
  dateField: '[data-testid="date-display-field"]',
  guestField: '[data-testid="quadruple-text"]',
  searchButton: 'button[type="submit"]',
  
  // Date picker
  calendar: '[data-testid="calendar"]',
  calendarDate: '[data-testid="calendar-date"]',
  
  // Guest selector
  adultIncrement: '[data-testid="adults-increment-btn"]',
  adultDecrement: '[data-testid="adults-decrement-btn"]',
  childrenIncrement: '[data-testid="children-increment-btn"]',
  roomIncrement: '[data-testid="rooms-increment-btn"]',
  
  // Search results
  resultsContainer: '[data-testid="property-list"]',
  propertyCard: '[data-testid="property-card"]',
  
  // Common
  cookieBanner: '[data-testid="cookie-banner"]',
  cookieAccept: '[data-testid="cookie-accept-btn"]'
};

/**
 * Fill the search form with parsed parameters
 * @param {Object} browser - Browser automation interface
 * @param {Object} params - Parsed search parameters from search-parser.js
 * @returns {Promise<boolean>} Success status
 */
async function fillSearchForm(browser, params) {
  try {
    console.log('🔍 Filling search form...');
    
    // Navigate to booking.com homepage
    console.log('  📍 Navigating to booking.com...');
    await browser.navigate({ 
      profile: 'chrome', 
      targetUrl: 'https://www.booking.com' 
    });
    
    // Wait for page to load
    await waitForPageLoad(browser);
    
    // Handle cookie banner if present
    await handleCookieBanner(browser);
    
    // Fill destination
    console.log(`  📍 Destination: ${params.destination}`);
    await fillDestination(browser, params.destination);
    
    // Fill dates
    console.log(`  📅 Dates: ${params.checkIn} to ${params.checkOut}`);
    await fillDates(browser, params.checkIn, params.checkOut);
    
    // Fill guests
    console.log(`  👥 Guests: ${params.adults} adults, ${params.children} children, ${params.rooms} rooms`);
    await fillGuests(browser, params.adults, params.children, params.rooms);
    
    console.log('✅ Search form filled successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Error filling search form:', error.message);
    return false;
  }
}

/**
 * Submit the search form and wait for results
 * @param {Object} browser - Browser automation interface
 * @returns {Promise<boolean>} Success status
 */
async function submitSearch(browser) {
  try {
    console.log('🔍 Submitting search...');
    
    // Click search button
    await browser.act({
      profile: 'chrome',
      request: {
        kind: 'click',
        selector: SELECTORS.searchButton
      }
    });
    
    // Wait for results to load
    console.log('  ⏳ Waiting for results...');
    const resultsLoaded = await waitForResults(browser);
    
    if (resultsLoaded) {
      console.log('✅ Search results loaded');
      return true;
    } else {
      console.error('❌ Search results did not load');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error submitting search:', error.message);
    return false;
  }
}

/**
 * Fill destination field
 */
async function fillDestination(browser, destination) {
  try {
    // Clear and type destination
    await browser.act({
      profile: 'chrome',
      request: {
        kind: 'type',
        selector: SELECTORS.destinationInput,
        text: destination
      }
    });
    
    // Press Enter to select first suggestion
    await browser.act({
      profile: 'chrome',
      request: {
        kind: 'press',
        key: 'Enter'
      }
    });
    
    // Wait for destination to be selected
    await sleep(1000);
    
  } catch (error) {
    throw new Error(`Failed to fill destination: ${error.message}`);
  }
}

/**
 * Fill check-in and check-out dates
 */
async function fillDates(browser, checkIn, checkOut) {
  try {
    // Click date field to open calendar
    await browser.act({
      profile: 'chrome',
      request: {
        kind: 'click',
        selector: SELECTORS.dateField
      }
    });
    
    await sleep(500);
    
    // TODO: Implement calendar date selection
    // This requires navigating the calendar UI
    // For now, we'll use a simplified approach
    
    console.log('  ⚠️  Calendar date selection needs implementation');
    
  } catch (error) {
    throw new Error(`Failed to fill dates: ${error.message}`);
  }
}

/**
 * Fill guest count and rooms
 */
async function fillGuests(browser, adults, children, rooms) {
  try {
    // Click guest field to open selector
    await browser.act({
      profile: 'chrome',
      request: {
        kind: 'click',
        selector: SELECTORS.guestField
      }
    });
    
    await sleep(500);
    
    // Adjust adults count (default is 2)
    const adultDiff = adults - 2;
    if (adultDiff > 0) {
      for (let i = 0; i < adultDiff; i++) {
        await browser.act({
          profile: 'chrome',
          request: {
            kind: 'click',
            selector: SELECTORS.adultIncrement
          }
        });
        await sleep(200);
      }
    } else if (adultDiff < 0) {
      for (let i = 0; i < Math.abs(adultDiff); i++) {
        await browser.act({
          profile: 'chrome',
          request: {
            kind: 'click',
            selector: SELECTORS.adultDecrement
          }
        });
        await sleep(200);
      }
    }
    
    // Adjust children count (default is 0)
    for (let i = 0; i < children; i++) {
      await browser.act({
        profile: 'chrome',
        request: {
          kind: 'click',
          selector: SELECTORS.childrenIncrement
        }
      });
      await sleep(200);
    }
    
    // Adjust room count (default is 1)
    const roomDiff = rooms - 1;
    for (let i = 0; i < roomDiff; i++) {
      await browser.act({
        profile: 'chrome',
        request: {
          kind: 'click',
          selector: SELECTORS.roomIncrement
        }
      });
      await sleep(200);
    }
    
    // Close guest selector
    await browser.act({
      profile: 'chrome',
      request: {
        kind: 'press',
        key: 'Escape'
      }
    });
    
    await sleep(300);
    
  } catch (error) {
    throw new Error(`Failed to fill guests: ${error.message}`);
  }
}

/**
 * Handle cookie banner if present
 */
async function handleCookieBanner(browser) {
  try {
    // Try to accept cookies
    await browser.act({
      profile: 'chrome',
      request: {
        kind: 'click',
        selector: SELECTORS.cookieAccept,
        timeout: 2000
      }
    });
    console.log('  🍪 Cookie banner accepted');
  } catch (error) {
    // Cookie banner not present or already accepted
    console.log('  ℹ️  No cookie banner');
  }
}

/**
 * Wait for page to load
 */
async function waitForPageLoad(browser, timeout = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const snapshot = await browser.snapshot({ 
        profile: 'chrome', 
        refs: 'aria' 
      });
      
      if (snapshot && snapshot.includes('booking.com')) {
        return true;
      }
    } catch (error) {
      // Page not ready yet
    }
    await sleep(500);
  }
  throw new Error('Page load timeout');
}

/**
 * Wait for search results to load
 */
async function waitForResults(browser, timeout = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const snapshot = await browser.snapshot({ 
        profile: 'chrome', 
        refs: 'aria' 
      });
      
      // Check if results container exists
      if (snapshot && (
        snapshot.includes('property') || 
        snapshot.includes('hotel') ||
        snapshot.includes('results')
      )) {
        return true;
      }
    } catch (error) {
      // Results not ready yet
    }
    await sleep(1000);
  }
  return false;
}

/**
 * Sleep helper
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Execute search end-to-end
 * @param {Object} browser - Browser automation interface
 * @param {Object} searchParams - Parsed search parameters
 * @returns {Promise<Object>} Search execution result
 */
async function executeSearch(browser, searchParams) {
  const result = {
    success: false,
    error: null,
    searchParams: searchParams,
    timestamp: new Date().toISOString()
  };
  
  try {
    // Fill form
    const formFilled = await fillSearchForm(browser, searchParams);
    if (!formFilled) {
      throw new Error('Failed to fill search form');
    }
    
    // Submit search
    const searchSubmitted = await submitSearch(browser);
    if (!searchSubmitted) {
      throw new Error('Failed to submit search');
    }
    
    result.success = true;
    
  } catch (error) {
    result.error = error.message;
    result.success = false;
  }
  
  return result;
}

// Export for use in other modules
module.exports = {
  fillSearchForm,
  submitSearch,
  fillDestination,
  fillDates,
  fillGuests,
  handleCookieBanner,
  waitForPageLoad,
  waitForResults,
  executeSearch,
  SELECTORS,
  sleep
};

// CLI mode for testing
if (require.main === module) {
  console.log('Search Form Automation Module');
  console.log('This module requires browser automation to be configured.');
  console.log('\nUsage:');
  console.log('  const { executeSearch } = require("./search-form.js");');
  console.log('  const result = await executeSearch(browser, searchParams);');
}
