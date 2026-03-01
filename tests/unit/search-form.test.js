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
    it('should have required selectors defined', () => {
      assert.ok(searchForm.SELECTORS.destinationInput);
      assert.ok(searchForm.SELECTORS.dateField);
      assert.ok(searchForm.SELECTORS.guestField);
      assert.ok(searchForm.SELECTORS.searchButton);
    });
    
    it('should have cookie banner selector', () => {
      assert.ok(searchForm.SELECTORS.cookieBanner);
      assert.ok(searchForm.SELECTORS.cookieAccept);
    });
    
    it('should have results selectors', () => {
      assert.ok(searchForm.SELECTORS.resultsContainer);
      assert.ok(searchForm.SELECTORS.propertyCard);
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
  
  describe('executeSearch result structure', () => {
    it('should return proper result structure', async () => {
      // Mock browser
      const mockBrowser = {
        navigate: async () => ({ success: true }),
        snapshot: async () => 'booking.com loaded',
        act: async () => ({ success: true })
      };
      
      const params = {
        destination: 'Paris',
        checkIn: '2026-03-15',
        checkOut: '2026-03-20',
        adults: 2,
        children: 0,
        rooms: 1
      };
      
      const result = await searchForm.executeSearch(mockBrowser, params);
      
      assert.ok(result.hasOwnProperty('success'));
      assert.ok(result.hasOwnProperty('searchParams'));
      assert.ok(result.hasOwnProperty('timestamp'));
      assert.ok(result.hasOwnProperty('error') || result.hasOwnProperty('success'));
    });
  });

});
