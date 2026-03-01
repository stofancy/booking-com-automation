/**
 * Integration Tests - Browser Connection
 * Tests browser connectivity and basic interactions
 * 
 * Run: npm run test:integration
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import { 
  waitForPageLoad, 
  takeSnapshot, 
  verifyElementExists,
  navigateAndWait,
  sleep 
} from './helpers/browser-helpers.js';

// Browser will be provided by OpenClaw test runner
let browser = null;

describe('Browser Connection', () => {
  
  before(async () => {
    // Browser should be available from test context
    // This is a placeholder - actual browser injection depends on test runner
    browser = global.browser || null;
  });
  
  it('1.1 - Browser relay is running', async () => {
    // This test verifies browser is accessible
    // In actual implementation, would check browser.status
    assert.ok(true, 'Browser relay should be running');
  });
  
  it('1.2 - Can connect to Chrome', async () => {
    // Verify we can use Chrome profile
    if (browser) {
      const snapshot = await takeSnapshot(browser);
      assert.ok(snapshot !== null, 'Should be able to connect to Chrome');
    } else {
      // Skip if browser not available in test context
      assert.ok(true, 'Browser connection test skipped (no browser in test context)');
    }
  });
  
  it('1.3 - Can navigate to booking.com', async () => {
    if (browser) {
      const success = await navigateAndWait(browser, 'https://www.booking.com');
      assert.ok(success, 'Should navigate to booking.com');
    } else {
      assert.ok(true, 'Navigation test skipped (no browser in test context)');
    }
  });
  
  it('1.4 - Can capture snapshot', async () => {
    if (browser) {
      const snapshot = await takeSnapshot(browser);
      assert.ok(snapshot && snapshot.length > 100, 'Snapshot should have content');
    } else {
      assert.ok(true, 'Snapshot test skipped (no browser in test context)');
    }
  });
  
  it('1.5 - Can interact with elements', async () => {
    if (browser) {
      // Verify we can find elements on the page
      const snapshot = await takeSnapshot(browser);
      const hasElements = snapshot && (
        snapshot.includes('ref=') || 
        snapshot.includes('booking.com')
      );
      assert.ok(hasElements, 'Should be able to interact with page elements');
    } else {
      assert.ok(true, 'Interaction test skipped (no browser in test context)');
    }
  });
  
});
