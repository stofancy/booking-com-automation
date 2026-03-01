/**
 * Unit Tests for Property Selector
 * Tests the property-selector.js module
 * 
 * Run: npm test
 */

const assert = require('assert');
const { describe, it } = require('node:test');

// Import module
const propertySelector = require('../../scripts/property-selector.js');

describe('Property Selector', () => {
  
  describe('isOnPropertyDetailsPage', () => {
    it('should return true for property details page', () => {
      const snapshot = 'Property details for Hotel Paris. Rooms available. Amenities include WiFi.';
      assert.strictEqual(propertySelector.isOnPropertyDetailsPage(snapshot), true);
    });
    
    it('should return true for hotel details page', () => {
      const snapshot = 'Hotel details and reviews for Grand Hotel';
      assert.strictEqual(propertySelector.isOnPropertyDetailsPage(snapshot), true);
    });
    
    it('should return true for rooms page', () => {
      const snapshot = 'Available rooms and pricing';
      assert.strictEqual(propertySelector.isOnPropertyDetailsPage(snapshot), true);
    });
    
    it('should return true for amenities page', () => {
      const snapshot = 'Hotel amenities and facilities';
      assert.strictEqual(propertySelector.isOnPropertyDetailsPage(snapshot), true);
    });
    
    it('should return false for search results page', () => {
      const snapshot = 'Search results: 150 hotels found in Paris';
      assert.strictEqual(propertySelector.isOnPropertyDetailsPage(snapshot), false);
    });
    
    it('should return false for null snapshot', () => {
      assert.strictEqual(propertySelector.isOnPropertyDetailsPage(null), false);
    });
    
    it('should return false for empty snapshot', () => {
      assert.strictEqual(propertySelector.isOnPropertyDetailsPage(''), false);
    });
  });
  
  describe('sleep helper', () => {
    it('should delay execution', async () => {
      const start = Date.now();
      await propertySelector.sleep(100);
      const end = Date.now();
      const duration = end - start;
      assert.ok(duration >= 90, `Sleep should be at least 90ms, was ${duration}ms`);
      assert.ok(duration < 200, `Sleep should be less than 200ms, was ${duration}ms`);
    });
  });
  
  describe('selectProperty', () => {
    it('should handle empty results', async () => {
      const mockBrowser = {
        snapshot: async () => 'search results',
        act: async () => ({ success: true })
      };
      
      const result = await propertySelector.selectProperty(mockBrowser, [], 1);
      
      assert.strictEqual(result.success, false);
      assert.ok(result.error.includes('No results'));
    });
    
    it('should handle invalid index', async () => {
      const mockBrowser = {
        snapshot: async () => 'search results',
        act: async () => ({ success: true })
      };
      
      const results = [{ name: 'Hotel 1' }, { name: 'Hotel 2' }];
      const result = await propertySelector.selectProperty(mockBrowser, results, 5);
      
      assert.strictEqual(result.success, false);
      assert.ok(result.error.includes('Invalid index'));
    });
    
    it('should handle index less than 1', async () => {
      const mockBrowser = {
        snapshot: async () => 'search results',
        act: async () => ({ success: true })
      };
      
      const results = [{ name: 'Hotel 1' }];
      const result = await propertySelector.selectProperty(mockBrowser, results, 0);
      
      assert.strictEqual(result.success, false);
      assert.ok(result.error.includes('Invalid index'));
    });
    
    it('should return success with valid input', async () => {
      const mockBrowser = {
        snapshot: async () => 'property details page with rooms',
        act: async () => ({ success: true })
      };
      
      const results = [
        { name: 'Hotel Paris' },
        { name: 'Hotel London' }
      ];
      
      const result = await propertySelector.selectProperty(mockBrowser, results, 1);
      
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.index, 1);
      assert.strictEqual(result.name, 'Hotel Paris');
      assert.ok(result.timestamp);
    });
    
    it('should handle page load timeout', async () => {
      const mockBrowser = {
        snapshot: async () => 'still loading...',
        act: async () => ({ success: true })
      };
      
      const results = [{ name: 'Hotel' }];
      const result = await propertySelector.selectProperty(mockBrowser, results, 1);
      
      assert.strictEqual(result.success, false);
      assert.ok(result.error.includes('Failed to load'));
    });
  });
  
  describe('navigateToPropertyDetails', () => {
    it('should navigate to property URL', async () => {
      const mockBrowser = {
        navigate: async (params) => ({ success: true }),
        snapshot: async () => 'property details page'
      };
      
      const result = await propertySelector.navigateToPropertyDetails(
        mockBrowser,
        'https://booking.com/hotel/123'
      );
      
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.url, 'https://booking.com/hotel/123');
      assert.ok(result.timestamp);
    });
    
    it('should handle navigation failure', async () => {
      const mockBrowser = {
        navigate: async (params) => ({ success: true }),
        snapshot: async () => 'error page'
      };
      
      const result = await propertySelector.navigateToPropertyDetails(
        mockBrowser,
        'https://invalid-url.com'
      );
      
      assert.strictEqual(result.success, false);
      assert.ok(result.error);
    });
  });
  
  describe('goBackToSearchResults', () => {
    it('should navigate back', async () => {
      const mockBrowser = {
        navigate: async (params) => ({ success: true })
      };
      
      const result = await propertySelector.goBackToSearchResults(mockBrowser);
      
      assert.strictEqual(result.success, true);
      assert.ok(result.timestamp);
    });
  });
  
  describe('handlePropertyPagePopups', () => {
    it('should handle popups without error', async () => {
      const mockBrowser = {
        act: async () => ({ success: true })
      };
      
      // Should not throw
      await propertySelector.handlePropertyPagePopups(mockBrowser);
    });
  });
  
  describe('handleCookieBanner', () => {
    it('should attempt to accept cookies', async () => {
      const mockBrowser = {
        act: async () => ({ success: true })
      };
      
      // Should not throw
      await propertySelector.handleCookieBanner(mockBrowser);
    });
  });
  
  describe('handleLoginPopup', () => {
    it('should attempt to close login popup', async () => {
      const mockBrowser = {
        act: async () => ({ success: true })
      };
      
      // Should not throw
      await propertySelector.handleLoginPopup(mockBrowser);
    });
  });
  
  describe('waitForPropertyDetailsPage', () => {
    it('should return true when page loads', async () => {
      const mockBrowser = {
        snapshot: async () => 'property details with rooms and amenities'
      };
      
      const result = await propertySelector.waitForPropertyDetailsPage(mockBrowser, 5000);
      assert.strictEqual(result, true);
    });
    
    it('should return false on timeout', async () => {
      const mockBrowser = {
        snapshot: async () => 'still loading search results...'
      };
      
      const result = await propertySelector.waitForPropertyDetailsPage(mockBrowser, 1000);
      assert.strictEqual(result, false);
    });
  });
  
  describe('clickOnProperty', () => {
    it('should click on property card', async () => {
      const mockBrowser = {
        snapshot: async () => 'search results with property cards',
        act: async () => ({ success: true })
      };
      
      // Should not throw
      await propertySelector.clickOnProperty(mockBrowser, 1);
    });
    
    it('should handle click failure', async () => {
      const mockBrowser = {
        snapshot: async () => { throw new Error('Snapshot failed'); },
        act: async () => ({ success: true })
      };
      
      try {
        await propertySelector.clickOnProperty(mockBrowser, 1);
        assert.fail('Should have thrown');
      } catch (error) {
        assert.ok(error.message.includes('Failed to click'));
      }
    });
  });

});
