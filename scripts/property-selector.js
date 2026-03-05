#!/usr/bin/env node

/**
 * Property Selector for booking.com
 * Handles selecting a property from search results and navigating to details page
 * Uses ARIA ref-based approach for reliable element interaction
 * 
 * Usage:
 *   const { selectProperty, navigateToPropertyDetails } = require('./property-selector.js');
 *   const property = await selectProperty(browser, results, 1);
 */

/**
 * Select a property from search results and navigate to details page
 * @param {Object} browser - Browser automation interface
 * @param {Array} results - Array of hotel results from search
 * @param {number} index - Index of property to select (1-based)
 * @returns {Promise<Object>} Property details object
 */
async function selectProperty(browser, results, index = 1) {
  try {
    console.log(`🏨 Selecting property #${index}...`);
    
    // Validate results
    if (!results || results.length === 0) {
      throw new Error('No results available to select from');
    }
    
    if (index < 1 || index > results.length) {
      throw new Error(`Invalid index ${index}. Must be between 1 and ${results.length}`);
    }
    
    const selectedHotel = results[index - 1];
    
    // Click on property using ARIA ref approach
    console.log(`  📍 Clicking on: ${selectedHotel.name || `Property ${index}`}`);
    await clickOnProperty(browser, index);
    
    // Wait for details page to load
    console.log('  ⏳ Waiting for property details page...');
    const loaded = await waitForPropertyDetailsPage(browser);
    
    if (!loaded) {
      throw new Error('Failed to load property details page');
    }
    
    console.log('✅ Property details page loaded');
    
    // Return property info
    return {
      success: true,
      index: index,
      name: selectedHotel.name || `Property ${index}`,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error selecting property:', error.message);
    return {
      success: false,
      error: error.message,
      index: index,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Click on a property from search results using ARIA refs
 * Follows the pattern from results-extractor.js:
 * - Find listitem "Property" elements
 * - Get the link inside each property card
 * - Click using ARIA ref
 */
async function clickOnProperty(browser, index) {
  try {
    // Get snapshot with ARIA refs
    const snapshot = await browser.snapshot({
      profile: 'chrome',
      refs: 'aria'
    });
    
    if (!snapshot || !snapshot.elements) {
      throw new Error('Failed to get page snapshot');
    }
    
    console.log('  🔍 Finding property card using ARIA...');
    
    // Find all property listitems
    const propertyCards = findPropertyCards(snapshot.elements);
    
    if (propertyCards.length === 0) {
      throw new Error('No property cards found on page');
    }
    
    if (index > propertyCards.length) {
      throw new Error(`Property index ${index} not found (only ${propertyCards.length} properties)`);
    }
    
    // Get the target property card (0-indexed)
    const targetCard = propertyCards[index - 1];
    
    if (!targetCard || !targetCard.ref) {
      throw new Error(`Property card ${index} does not have a clickable ref`);
    }
    
    console.log(`  🎯 Clicking property ${index} (ref: ${targetCard.ref})`);
    
    // Click using ARIA ref
    await browser.act({
      profile: 'chrome',
      request: {
        kind: 'click',
        ref: targetCard.ref
      }
    });
    
    // Wait for navigation
    await sleep(1000);
    
    console.log('  ✅ Property clicked');
    
  } catch (error) {
    throw new Error(`Failed to click property: ${error.message}`);
  }
}

/**
 * Find all property cards from snapshot elements
 * Property cards are typically listitem elements with role "Property" or containing property info
 * @param {Array} elements - Snapshot elements array
 * @returns {Array} Array of property card objects with ref
 */
function findPropertyCards(elements) {
  const cards = [];
  
  // First, try to find listitem with role containing "Property"
  for (const element of elements) {
    if (element.role === 'listitem' && element.name && element.name.includes('Property')) {
      // Find the link inside this listitem
      const link = findLinkInElement(element);
      if (link) {
        cards.push({
          name: element.name,
          ref: link.ref,
          url: link.url
        });
      }
    }
    
    // Also check for generic containers that might contain property info
    if (element.role === 'group' || element.role === 'article') {
      const groupCards = findPropertyCards(element.children || []);
      cards.push(...groupCards);
    }
    
    // Recurse into children
    if (element.children) {
      const childCards = findPropertyCards(element.children);
      cards.push(...childCards);
    }
  }
  
  return cards;
}

/**
 * Find a link element within an element tree
 * @param {Object} element - Parent element to search within
 * @returns {Object|null} Link element with ref or null
 */
function findLinkInElement(element) {
  if (!element) return null;
  
  // Direct link
  if (element.role === 'link' && element.ref) {
    return element;
  }
  
  // Check children
  if (element.children) {
    for (const child of element.children) {
      const found = findLinkInElement(child);
      if (found) return found;
    }
  }
  
  return null;
}

/**
 * Wait for property details page to load
 */
async function waitForPropertyDetailsPage(browser, timeout = 15000) {
  const start = Date.now();
  
  while (Date.now() - start < timeout) {
    try {
      const snapshot = await browser.snapshot({
        profile: 'chrome',
        refs: 'aria'
      });
      
      // Check for property details page indicators
      if (snapshot && (
        snapshot.includes('property details') ||
        snapshot.includes('hotel details') ||
        snapshot.includes('rooms') ||
        snapshot.includes('amenities')
      )) {
        return true;
      }
    } catch (error) {
      // Page not ready yet
    }
    
    await sleep(1000);
  }
  
  return false;
}

/**
 * Handle property page popups (cookies, login, etc.)
 */
async function handlePropertyPagePopups(browser) {
  try {
    // Handle cookie banner
    await handleCookieBanner(browser);
    
    // Handle login popup if appears
    await handleLoginPopup(browser);
    
    console.log('  ✅ Popups handled');
  } catch (error) {
    console.warn('  ⚠️  Some popups may not have been handled');
  }
}

/**
 * Handle cookie banner on property page
 */
async function handleCookieBanner(browser) {
  try {
    await browser.act({
      profile: 'chrome',
      request: {
        kind: 'click',
        selector: '[data-testid="cookie-accept-btn"]',
        timeout: 2000
      }
    });
    console.log('  🍪 Cookie banner accepted');
  } catch (error) {
    // Cookie banner not present
  }
}

/**
 * Handle login popup if it appears
 */
async function handleLoginPopup(browser) {
  try {
    // Close login popup if it appears
    await browser.act({
      profile: 'chrome',
      request: {
        kind: 'click',
        selector: '[data-testid="login-popup-close"]',
        timeout: 1000
      }
    });
    console.log('  🔒 Login popup closed');
  } catch (error) {
    // Login popup not present
  }
}

/**
 * Navigate directly to property details page by URL
 */
async function navigateToPropertyDetails(browser, propertyUrl) {
  try {
    console.log('🔗 Navigating to property details...');
    
    await browser.navigate({
      profile: 'chrome',
      targetUrl: propertyUrl
    });
    
    // Wait for page to load
    const loaded = await waitForPropertyDetailsPage(browser);
    
    if (!loaded) {
      throw new Error('Property details page did not load');
    }
    
    console.log('✅ Property details page loaded');
    
    return {
      success: true,
      url: propertyUrl,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error navigating to property:', error.message);
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
 */
async function goBackToSearchResults(browser) {
  try {
    console.log('↩️  Going back to search results...');
    
    await browser.navigate({
      profile: 'chrome',
      targetUrl: 'javascript:history.back()'
    });
    
    // Wait for results page
    await sleep(2000);
    
    console.log('✅ Back to search results');
    
    return {
      success: true,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error going back:', error.message);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Check if currently on property details page
 */
function isOnPropertyDetailsPage(snapshot) {
  if (!snapshot) {
    return false;
  }
  
  // Check for property details page indicators (case-insensitive)
  const lowerSnapshot = snapshot.toLowerCase();
  return (
    lowerSnapshot.includes('property details') ||
    lowerSnapshot.includes('hotel details') ||
    lowerSnapshot.includes('rooms') ||
    lowerSnapshot.includes('amenities') ||
    lowerSnapshot.includes('reviews')
  );
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
  console.log('This module requires browser automation to be configured.');
  console.log('\nUsage:');
  console.log('  const { selectProperty } = require("./property-selector.js");');
  console.log('  const result = await selectProperty(browser, results, 1);');
}
