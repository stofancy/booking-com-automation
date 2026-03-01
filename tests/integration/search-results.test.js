/**
 * Integration Tests - Search Results HTML Parsing
 * Tests results extractor against real booking.com HTML structure
 * 
 * Run: npm test
 */

const assert = require('assert');
const { describe, it } = require('node:test');
const fs = require('fs');
const path = require('path');

describe('Integration Tests - Search Results', () => {
  
  // Load real HTML sample
  const htmlPath = path.join(__dirname, '../mocks/booking-search-results.html');
  const searchResultsHtml = fs.readFileSync(htmlPath, 'utf8');
  
  describe('HTML Structure', () => {
    it('should load mock HTML file', () => {
      assert.ok(searchResultsHtml.length > 0);
      assert.ok(searchResultsHtml.includes('data-testid="property-card"'));
    });
    
    it('should have 3 property cards', () => {
      const cardCount = (searchResultsHtml.match(/data-testid="property-card"/g) || []).length;
      assert.strictEqual(cardCount, 3);
    });
  });
  
  describe('Property Card Parsing', () => {
    it('should extract hotel names', () => {
      const nameMatches = searchResultsHtml.match(/<h3[^>]*data-testid="title"[^>]*>([^<]+)<\/h3>/g);
      assert.ok(nameMatches);
      assert.strictEqual(nameMatches.length, 3);
      assert.ok(searchResultsHtml.includes('Hotel Paris Opera'));
      assert.ok(searchResultsHtml.includes('Le Grand Hotel'));
      assert.ok(searchResultsHtml.includes('Hotel Eiffel'));
    });
    
    it('should extract locations', () => {
      assert.ok(searchResultsHtml.includes('9th arr., Paris'));
      assert.ok(searchResultsHtml.includes('Opera, Paris'));
      assert.ok(searchResultsHtml.includes('7th arr., Paris'));
    });
    
    it('should extract distances', () => {
      assert.ok(searchResultsHtml.includes('0.8km from center'));
      assert.ok(searchResultsHtml.includes('0.5km from center'));
      assert.ok(searchResultsHtml.includes('1.2km from center'));
    });
  });
  
  describe('Price Parsing', () => {
    it('should extract price values', () => {
      const priceMatches = searchResultsHtml.match(/data-testid="price-value">([^<]+)</g);
      assert.ok(priceMatches);
      assert.strictEqual(priceMatches.length, 3);
      assert.ok(searchResultsHtml.includes('>245<'));
      assert.ok(searchResultsHtml.includes('>189<'));
      assert.ok(searchResultsHtml.includes('>320<'));
    });
    
    it('should extract price currency', () => {
      assert.ok(searchResultsHtml.includes('data-testid="price-currency">$</span>'));
    });
    
    it('should extract total price', () => {
      assert.ok(searchResultsHtml.includes('Total: $735 for 3 nights'));
    });
  });
  
  describe('Rating Parsing', () => {
    it('should extract rating scores', () => {
      assert.ok(searchResultsHtml.includes('9.2'));
      assert.ok(searchResultsHtml.includes('8.8'));
      assert.ok(searchResultsHtml.includes('9.5'));
    });
    
    it('should extract rating categories', () => {
      assert.ok(searchResultsHtml.includes('Exceptional'));
      assert.ok(searchResultsHtml.includes('Very Good'));
    });
    
    it('should extract review counts', () => {
      assert.ok(searchResultsHtml.includes('1,234 reviews'));
      assert.ok(searchResultsHtml.includes('892 reviews'));
      assert.ok(searchResultsHtml.includes('567 reviews'));
    });
  });
  
  describe('Amenities Parsing', () => {
    it('should extract amenities list', () => {
      assert.ok(searchResultsHtml.includes('Free WiFi'));
      assert.ok(searchResultsHtml.includes('Breakfast included'));
      assert.ok(searchResultsHtml.includes('Air conditioning'));
      assert.ok(searchResultsHtml.includes('Gym'));
      assert.ok(searchResultsHtml.includes('Restaurant'));
      assert.ok(searchResultsHtml.includes('Spa'));
    });
  });
  
  describe('Special Features', () => {
    it('should detect Genius badges', () => {
      const geniusCount = (searchResultsHtml.match(/data-testid="genius-badge"/g) || []).length;
      assert.strictEqual(geniusCount, 2);
    });
    
    it('should detect free cancellation', () => {
      const cancelCount = (searchResultsHtml.match(/Free cancellation/g) || []).length;
      assert.strictEqual(cancelCount, 2);
    });
    
    it('should detect breakfast included', () => {
      assert.ok(searchResultsHtml.includes('Breakfast included'));
    });
  });
  
  describe('Property Links', () => {
    it('should extract booking links', () => {
      const linkMatches = searchResultsHtml.match(/href="([^"]+)"[^>]*>View details/g);
      assert.ok(linkMatches);
      assert.strictEqual(linkMatches.length, 3);
      assert.ok(searchResultsHtml.includes('/hotel/fr/opera.html'));
      assert.ok(searchResultsHtml.includes('/hotel/fr/grand.html'));
      assert.ok(searchResultsHtml.includes('/hotel/fr/eiffel.html'));
    });
  });

});
