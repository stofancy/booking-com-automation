/**
 * Browser Helpers for Integration Tests
 * Shared utilities for booking.com integration testing
 */

/**
 * Wait for page to load
 * @param {Object} browser - Browser automation interface
 * @param {number} timeout - Timeout in ms
 * @returns {Promise<boolean>}
 */
export async function waitForPageLoad(browser, timeout = 10000) {
  const start = Date.now();
  
  while (Date.now() - start < timeout) {
    try {
      const snapshot = await browser.snapshot({
        profile: 'chrome',
        refs: 'aria'
      });
      
      if (snapshot && snapshot.length > 100) {
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
 * Take snapshot with error handling
 * @param {Object} browser - Browser automation interface
 * @returns {Promise<string|null>}
 */
export async function takeSnapshot(browser) {
  try {
    const snapshot = await browser.snapshot({
      profile: 'chrome',
      refs: 'aria'
    });
    
    return snapshot || null;
  } catch (error) {
    console.error('Snapshot error:', error.message);
    return null;
  }
}

/**
 * Verify element exists on page
 * @param {Object} browser - Browser automation interface
 * @param {string} ref - ARIA ref to find
 * @returns {Promise<boolean>}
 */
export async function verifyElementExists(browser, ref) {
  try {
    const snapshot = await takeSnapshot(browser);
    
    if (!snapshot) {
      return false;
    }
    
    return snapshot.includes(`ref=${ref}`);
  } catch (error) {
    return false;
  }
}

/**
 * Navigate to URL and wait for load
 * @param {Object} browser - Browser automation interface
 * @param {string} url - URL to navigate to
 * @param {number} timeout - Timeout in ms
 * @returns {Promise<boolean>}
 */
export async function navigateAndWait(browser, url, timeout = 10000) {
  try {
    await browser.navigate({
      profile: 'chrome',
      targetUrl: url
    });
    
    return await waitForPageLoad(browser, timeout);
  } catch (error) {
    console.error('Navigation error:', error.message);
    return false;
  }
}

/**
 * Click element with error handling
 * @param {Object} browser - Browser automation interface
 * @param {string} ref - ARIA ref to click
 * @returns {Promise<boolean>}
 */
export async function clickElement(browser, ref) {
  try {
    await browser.act({
      profile: 'chrome',
      request: {
        kind: 'click',
        ref: ref
      }
    });
    
    return true;
  } catch (error) {
    console.error('Click error:', error.message);
    return false;
  }
}

/**
 * Type text into element
 * @param {Object} browser - Browser automation interface
 * @param {string} ref - ARIA ref to type into
 * @param {string} text - Text to type
 * @returns {Promise<boolean>}
 */
export async function typeText(browser, ref, text) {
  try {
    await browser.act({
      profile: 'chrome',
      request: {
        kind: 'type',
        ref: ref,
        text: text
      }
    });
    
    return true;
  } catch (error) {
    console.error('Type error:', error.message);
    return false;
  }
}

/**
 * Sleep helper
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Extract text from snapshot by pattern
 * @param {string} snapshot - Page snapshot
 * @param {RegExp} pattern - Pattern to match
 * @returns {string|null}
 */
export function extractFromSnapshot(snapshot, pattern) {
  if (!snapshot) {
    return null;
  }
  
  const match = snapshot.match(pattern);
  return match ? match[1] || match[0] : null;
}

/**
 * Verify extracted data matches expected
 * @param {any} extracted - Extracted value
 * @param {any} expected - Expected value or range
 * @param {number} accuracyThreshold - Accuracy threshold (0-1)
 * @returns {boolean}
 */
export function verifyAccuracy(extracted, expected, accuracyThreshold = 0.9) {
  if (expected === null || expected === undefined) {
    return extracted === null || extracted === undefined;
  }
  
  if (typeof expected === 'object' && expected.min !== undefined && expected.max !== undefined) {
    // Range check
    return extracted >= expected.min && extracted <= expected.max;
  }
  
  if (typeof expected === 'number' && typeof extracted === 'number') {
    // Numeric comparison with threshold
    const accuracy = 1 - (Math.abs(extracted - expected) / expected);
    return accuracy >= accuracyThreshold;
  }
  
  // String comparison
  if (typeof expected === 'string' && typeof extracted === 'string') {
    return extracted.toLowerCase().includes(expected.toLowerCase());
  }
  
  // Exact match
  return extracted === expected;
}
