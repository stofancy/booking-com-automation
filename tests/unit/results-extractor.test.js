/**
 * Unit Tests for Results Extractor
 * Tests the results-extractor.js module
 * 
 * Run: npm test
 */

const assert = require('assert');
const { describe, it } = require('node:test');

// Import module
const resultsExtractor = require('../../scripts/results-extractor.js');

describe('Results Extractor', () => {
  
  describe('getRatingCategory', () => {
    it('should return "Exceptional" for 9.0+', () => {
      assert.strictEqual(resultsExtractor.getRatingCategory(9.5), 'Exceptional');
      assert.strictEqual(resultsExtractor.getRatingCategory(9.0), 'Exceptional');
    });
    
    it('should return "Very Good" for 8.0-8.9', () => {
      assert.strictEqual(resultsExtractor.getRatingCategory(8.9), 'Very Good');
      assert.strictEqual(resultsExtractor.getRatingCategory(8.0), 'Very Good');
    });
    
    it('should return "Good" for 7.0-7.9', () => {
      assert.strictEqual(resultsExtractor.getRatingCategory(7.5), 'Good');
      assert.strictEqual(resultsExtractor.getRatingCategory(7.0), 'Good');
    });
    
    it('should return "Pleasant" for 6.0-6.9', () => {
      assert.strictEqual(resultsExtractor.getRatingCategory(6.5), 'Pleasant');
      assert.strictEqual(resultsExtractor.getRatingCategory(6.0), 'Pleasant');
    });
    
    it('should return "Okay" for below 6.0', () => {
      assert.strictEqual(resultsExtractor.getRatingCategory(5.5), 'Okay');
      assert.strictEqual(resultsExtractor.getRatingCategory(1.0), 'Okay');
    });
  });
  
  describe('sortResults', () => {
    it('should sort by price (lowest first)', () => {
      const results = [
        { name: 'Hotel A', pricePerNight: 200, rating: 8.0 },
        { name: 'Hotel B', pricePerNight: 100, rating: 7.0 },
        { name: 'Hotel C', pricePerNight: 150, rating: 9.0 }
      ];
      
      const sorted = resultsExtractor.sortResults(results, 'price');
      
      assert.strictEqual(sorted[0].pricePerNight, 100);
      assert.strictEqual(sorted[1].pricePerNight, 150);
      assert.strictEqual(sorted[2].pricePerNight, 200);
    });
    
    it('should sort by rating (highest first)', () => {
      const results = [
        { name: 'Hotel A', pricePerNight: 200, rating: 8.0 },
        { name: 'Hotel B', pricePerNight: 100, rating: 9.0 },
        { name: 'Hotel C', pricePerNight: 150, rating: 7.0 }
      ];
      
      const sorted = resultsExtractor.sortResults(results, 'rating');
      
      assert.strictEqual(sorted[0].rating, 9.0);
      assert.strictEqual(sorted[1].rating, 8.0);
      assert.strictEqual(sorted[2].rating, 7.0);
    });
    
    it('should sort by bestValue (rating/price ratio)', () => {
      const results = [
        { name: 'Hotel A', pricePerNight: 200, rating: 8.0 }, // ratio: 0.04
        { name: 'Hotel B', pricePerNight: 100, rating: 9.0 }, // ratio: 0.09
        { name: 'Hotel C', pricePerNight: 150, rating: 7.0 }  // ratio: 0.047
      ];
      
      const sorted = resultsExtractor.sortResults(results, 'bestValue');
      
      assert.strictEqual(sorted[0].name, 'Hotel B'); // Best ratio
    });
    
    it('should handle missing price/rating gracefully', () => {
      const results = [
        { name: 'Hotel A', pricePerNight: null, rating: null },
        { name: 'Hotel B', pricePerNight: 100, rating: 8.0 }
      ];
      
      const sorted = resultsExtractor.sortResults(results, 'price');
      
      assert.ok(sorted.length === 2);
    });
  });
  
  describe('filterResults', () => {
    it('should filter by maxPrice', () => {
      const results = [
        { name: 'Hotel A', pricePerNight: 200 },
        { name: 'Hotel B', pricePerNight: 100 },
        { name: 'Hotel C', pricePerNight: 150 }
      ];
      
      const filtered = resultsExtractor.filterResults(results, { maxPrice: 150 });
      
      assert.strictEqual(filtered.length, 2);
      assert.ok(filtered.every(h => h.pricePerNight <= 150));
    });
    
    it('should filter by minRating', () => {
      const results = [
        { name: 'Hotel A', rating: 9.0 },
        { name: 'Hotel B', rating: 7.0 },
        { name: 'Hotel C', rating: 8.5 }
      ];
      
      const filtered = resultsExtractor.filterResults(results, { minRating: 8.0 });
      
      assert.strictEqual(filtered.length, 2);
      assert.ok(filtered.every(h => h.rating >= 8.0));
    });
    
    it('should filter by geniusOnly', () => {
      const results = [
        { name: 'Hotel A', genius: true },
        { name: 'Hotel B', genius: false },
        { name: 'Hotel C', genius: true }
      ];
      
      const filtered = resultsExtractor.filterResults(results, { geniusOnly: true });
      
      assert.strictEqual(filtered.length, 2);
      assert.ok(filtered.every(h => h.genius === true));
    });
    
    it('should filter by freeCancellation', () => {
      const results = [
        { name: 'Hotel A', freeCancellation: true },
        { name: 'Hotel B', freeCancellation: false }
      ];
      
      const filtered = resultsExtractor.filterResults(results, { freeCancellation: true });
      
      assert.strictEqual(filtered.length, 1);
      assert.strictEqual(filtered[0].freeCancellation, true);
    });
    
    it('should apply multiple filters', () => {
      const results = [
        { name: 'Hotel A', pricePerNight: 200, rating: 9.0, genius: true },
        { name: 'Hotel B', pricePerNight: 100, rating: 7.0, genius: false },
        { name: 'Hotel C', pricePerNight: 150, rating: 8.5, genius: true }
      ];
      
      const filtered = resultsExtractor.filterResults(results, { 
        maxPrice: 180, 
        minRating: 8.0,
        geniusOnly: true 
      });
      
      assert.strictEqual(filtered.length, 1);
      assert.strictEqual(filtered[0].name, 'Hotel C');
    });
  });
  
  describe('findBestValue', () => {
    it('should return hotel with best rating/price ratio', () => {
      const results = [
        { name: 'Hotel A', pricePerNight: 200, rating: 8.0 },
        { name: 'Hotel B', pricePerNight: 100, rating: 9.0 },
        { name: 'Hotel C', pricePerNight: 150, rating: 7.0 }
      ];
      
      const best = resultsExtractor.findBestValue(results);
      
      assert.strictEqual(best.name, 'Hotel B');
    });
    
    it('should return null for empty array', () => {
      const best = resultsExtractor.findBestValue([]);
      assert.strictEqual(best, null);
    });
    
    it('should return null for undefined', () => {
      const best = resultsExtractor.findBestValue(undefined);
      assert.strictEqual(best, null);
    });
  });
  
  describe('findCheapest', () => {
    it('should return cheapest hotel', () => {
      const results = [
        { name: 'Hotel A', pricePerNight: 200 },
        { name: 'Hotel B', pricePerNight: 100 },
        { name: 'Hotel C', pricePerNight: 150 }
      ];
      
      const cheapest = resultsExtractor.findCheapest(results);
      
      assert.strictEqual(cheapest.name, 'Hotel B');
      assert.strictEqual(cheapest.pricePerNight, 100);
    });
    
    it('should return null for empty array', () => {
      const cheapest = resultsExtractor.findCheapest([]);
      assert.strictEqual(cheapest, null);
    });
  });
  
  describe('findHighestRated', () => {
    it('should return highest rated hotel', () => {
      const results = [
        { name: 'Hotel A', rating: 8.0 },
        { name: 'Hotel B', rating: 9.5 },
        { name: 'Hotel C', rating: 7.0 }
      ];
      
      const highest = resultsExtractor.findHighestRated(results);
      
      assert.strictEqual(highest.name, 'Hotel B');
      assert.strictEqual(highest.rating, 9.5);
    });
    
    it('should return null for empty array', () => {
      const highest = resultsExtractor.findHighestRated([]);
      assert.strictEqual(highest, null);
    });
  });
  
  describe('generateBookingLink', () => {
    it('should generate valid booking.com URL', () => {
      const link = resultsExtractor.generateBookingLink(
        'hotel-paris-123',
        '2026-03-15',
        '2026-03-20',
        2,
        0,
        1
      );
      
      assert.ok(link.includes('booking.com'));
      assert.ok(link.includes('checkin=2026-03-15'));
      assert.ok(link.includes('checkout=2026-03-20'));
      assert.ok(link.includes('group_adults=2'));
    });
    
    it('should handle children parameter', () => {
      const link = resultsExtractor.generateBookingLink(
        'hotel-123',
        '2026-03-15',
        '2026-03-20',
        2,
        1,
        1
      );
      
      assert.ok(link.includes('group_children=1'));
    });
  });
  
  describe('formatResults', () => {
    it('should format results as text', () => {
      const results = [
        {
          name: 'Hotel Paris',
          rating: 9.0,
          pricePerNight: 200,
          location: 'Paris Center',
          amenities: ['WiFi', 'Breakfast'],
          genius: true,
          bookingUrl: 'https://booking.com/hotel1'
        }
      ];
      
      const formatted = resultsExtractor.formatResults(results, { top: 5 });
      
      assert.ok(formatted.length > 0, 'Should return non-empty string');
      assert.ok(formatted.includes('Hotel Paris'), 'Should include hotel name');
    });
    
    it('should handle empty results', () => {
      const formatted = resultsExtractor.formatResults([]);
      assert.strictEqual(formatted, '');
    });
  });
  
  describe('extractHotelName (placeholder)', () => {
    it('should return placeholder value', () => {
      const name = resultsExtractor.extractHotelName({});
      assert.strictEqual(name, 'Hotel Name');
    });
  });
  
  describe('extractPrice (placeholder)', () => {
    it('should return price object with defaults', () => {
      const price = resultsExtractor.extractPrice({});
      assert.ok(typeof price === 'object');
      assert.strictEqual(price.currency, 'USD');
      assert.strictEqual(price.total, null);
      assert.strictEqual(price.perNight, null);
    });
  });
  
  describe('extractRating (placeholder)', () => {
    it('should return rating object with defaults', () => {
      const rating = resultsExtractor.extractRating({});
      assert.ok(typeof rating === 'object');
      assert.strictEqual(rating.outOf, 10);
      assert.strictEqual(rating.score, null);
      assert.strictEqual(rating.reviewCount, null);
    });
  });
  
  describe('extractLocation (placeholder)', () => {
    it('should return location object with defaults', () => {
      const location = resultsExtractor.extractLocation({});
      assert.ok(typeof location === 'object');
      assert.strictEqual(location.address, null);
      assert.strictEqual(location.city, null);
    });
  });
  
  describe('extractAmenities (placeholder)', () => {
    it('should return empty array', () => {
      const amenities = resultsExtractor.extractAmenities({});
      assert.ok(Array.isArray(amenities));
      assert.strictEqual(amenities.length, 0);
    });
  });
  
  describe('isGenius (placeholder)', () => {
    it('should return false', () => {
      const genius = resultsExtractor.isGenius({});
      assert.strictEqual(genius, false);
    });
  });
  
  describe('hasFreeCancellation (placeholder)', () => {
    it('should return false', () => {
      const freeCancel = resultsExtractor.hasFreeCancellation({});
      assert.strictEqual(freeCancel, false);
    });
  });
  
  describe('hasBreakfastIncluded (placeholder)', () => {
    it('should return false', () => {
      const breakfast = resultsExtractor.hasBreakfastIncluded({});
      assert.strictEqual(breakfast, false);
    });
  });

});
