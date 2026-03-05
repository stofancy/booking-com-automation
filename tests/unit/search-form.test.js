/**
 * Unit Tests for Search Form Automation
 * Tests the search-form.js module
 *
 * Run: npm test
 */

const assert = require('assert');
const { describe, it } = require('node:test');

// Import module
const searchForm = require('../../scripts/search-form.js');

describe('Search Form Automation', () => {

  describe('SELECTORS', () => {
    it('should have destination input selector', () => {
      assert.ok(searchForm.SELECTORS.destinationInput);
    });

    it('should have date field selector', () => {
      assert.ok(searchForm.SELECTORS.dateField);
    });

    it('should have guest field selector', () => {
      assert.ok(searchForm.SELECTORS.guestField);
    });

    it('should have search button selector', () => {
      assert.ok(searchForm.SELECTORS.searchButton);
    });

    it('should have cookie banner selector', () => {
      assert.ok(searchForm.SELECTORS.cookieBanner);
      assert.ok(searchForm.SELECTORS.cookieAccept);
    });
  });

  describe('sleep helper', () => {
    it('should delay execution', async () => {
      const start = Date.now();
      await searchForm.sleep(100);
      const end = Date.now();
      const duration = end - start;
      assert.ok(duration >= 90, `Sleep should be at least 90ms, was ${duration}ms`);
      assert.ok(duration < 200, `Sleep should be less than 200ms, was ${duration}ms`);
    });
  });

  describe('Module Exports', () => {
    it('should export fillSearchForm function', () => {
      assert.strictEqual(typeof searchForm.fillSearchForm, 'function');
    });

    it('should export submitSearch function', () => {
      assert.strictEqual(typeof searchForm.submitSearch, 'function');
    });

    it('should export executeSearch function', () => {
      assert.strictEqual(typeof searchForm.executeSearch, 'function');
    });

    it('should export runSearch function', () => {
      assert.strictEqual(typeof searchForm.runSearch, 'function');
    });
  });

});
