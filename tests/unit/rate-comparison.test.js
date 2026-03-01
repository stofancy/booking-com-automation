/**
 * Unit Tests for Rate Comparison
 * Tests the rate-comparison.js module
 * 
 * Run: npm test
 */

const assert = require('assert');
const { describe, it } = require('node:test');

// Import module
const rateComparison = require('../../scripts/rate-comparison.js');

describe('Rate Comparison', () => {
  
  describe('compareRates', () => {
    it('should compare rates across rooms', () => {
      const rooms = [
        {
          name: 'Room 1',
          rates: [{ perNight: 100, refundable: true }]
        },
        {
          name: 'Room 2',
          rates: [{ perNight: 150, refundable: false }]
        }
      ];
      
      const comparison = rateComparison.compareRates(rooms);
      
      assert.ok(comparison);
      assert.ok(comparison.cheapest);
      assert.ok(comparison.allRates);
    });
    
    it('should handle empty rooms', () => {
      const comparison = rateComparison.compareRates([]);
      
      assert.strictEqual(comparison.cheapest, null);
      assert.strictEqual(comparison.bestValue, null);
      assert.strictEqual(comparison.allRates.length, 0);
    });
    
    it('should handle rooms without rates', () => {
      const rooms = [
        { name: 'Room 1', rates: [] },
        { name: 'Room 2', rates: [] }
      ];
      
      const comparison = rateComparison.compareRates(rooms);
      
      assert.strictEqual(comparison.cheapest, null);
      assert.strictEqual(comparison.allRates.length, 0);
    });
  });
  
  describe('calculateValueScore', () => {
    it('should calculate score based on amenities', () => {
      const room = {
        amenities: ['Free WiFi', 'Breakfast', 'Pool']
      };
      const rate = { perNight: 100 };
      
      const score = rateComparison.calculateValueScore(room, rate);
      
      assert.ok(score > 0);
    });
    
    it('should bonus for refundable rate', () => {
      const room = { amenities: [] };
      const rate1 = { perNight: 100, refundable: true };
      const rate2 = { perNight: 100, refundable: false };
      
      const score1 = rateComparison.calculateValueScore(room, rate1);
      const score2 = rateComparison.calculateValueScore(room, rate2);
      
      assert.ok(score1 > score2);
    });
    
    it('should bonus for free cancellation', () => {
      const room = { amenities: [] };
      const rate1 = { perNight: 100, freeCancellation: true };
      const rate2 = { perNight: 100, freeCancellation: false };
      
      const score1 = rateComparison.calculateValueScore(room, rate1);
      const score2 = rateComparison.calculateValueScore(room, rate2);
      
      assert.ok(score1 > score2);
    });
    
    it('should bonus for breakfast', () => {
      const room = { amenities: [] };
      const rate1 = { perNight: 100, breakfastIncluded: true };
      const rate2 = { perNight: 100, breakfastIncluded: false };
      
      const score1 = rateComparison.calculateValueScore(room, rate1);
      const score2 = rateComparison.calculateValueScore(room, rate2);
      
      assert.ok(score1 > score2);
    });
    
    it('should divide by price for value score', () => {
      const room = { amenities: ['WiFi'] };
      const rate1 = { perNight: 100 };
      const rate2 = { perNight: 200 };
      
      const score1 = rateComparison.calculateValueScore(room, rate1);
      const score2 = rateComparison.calculateValueScore(room, rate2);
      
      // Lower price should give higher value score (same amenities)
      assert.ok(score1 > score2);
    });
  });
  
  describe('generateRateRecommendation', () => {
    it('should recommend best value when same as cheapest', () => {
      const cheapest = { roomName: 'Room 1', rate: { perNight: 100 } };
      const bestValue = { roomName: 'Room 1', rate: { perNight: 100 } };
      
      const rec = rateComparison.generateRateRecommendation(cheapest, bestValue, null);
      
      assert.strictEqual(rec.type, 'best_value');
      assert.ok(rec.confidence);
    });
    
    it('should recommend flexible if reasonably priced', () => {
      const cheapest = { roomName: 'Room 1', rate: { perNight: 100 } };
      const bestValue = { roomName: 'Room 2', rate: { perNight: 150 } };
      const mostFlexible = { roomName: 'Room 3', rate: { perNight: 110, freeCancellation: true } };
      
      const rec = rateComparison.generateRateRecommendation(cheapest, bestValue, mostFlexible);
      
      assert.strictEqual(rec.type, 'flexible');
      assert.ok(rec.reasons);
    });
    
    it('should recommend best value otherwise', () => {
      const cheapest = { roomName: 'Room 1', rate: { perNight: 100 } };
      const bestValue = { roomName: 'Room 2', rate: { perNight: 150 } };
      
      const rec = rateComparison.generateRateRecommendation(cheapest, bestValue, null);
      
      assert.strictEqual(rec.type, 'best_value');
    });
    
    it('should recommend cheapest if no other options', () => {
      const cheapest = { roomName: 'Room 1', rate: { perNight: 100 } };
      
      const rec = rateComparison.generateRateRecommendation(cheapest, null, null);
      
      assert.strictEqual(rec.type, 'cheapest');
    });
    
    it('should handle no rates', () => {
      const rec = rateComparison.generateRateRecommendation(null, null, null);
      
      assert.strictEqual(rec.type, 'none');
    });
  });
  
  describe('formatRateComparison', () => {
    it('should format comparison as text', () => {
      const comparison = {
        recommendation: {
          type: 'best_value',
          text: 'Best value option'
        },
        cheapest: { roomName: 'Room 1', rate: { perNight: 100, refundable: true } },
        bestValue: { roomName: 'Room 2', rate: { perNight: 150 } },
        allRates: []
      };
      
      const formatted = rateComparison.formatRateComparison(comparison);
      
      assert.ok(formatted.includes('Best value'));
      assert.ok(formatted.includes('Cheapest'));
    });
    
    it('should show all rates if option enabled', () => {
      const comparison = {
        recommendation: null,
        cheapest: null,
        bestValue: null,
        mostFlexible: null,
        allRates: [
          { roomName: 'Room 1', rate: { perNight: 100 } }
        ]
      };
      
      const formatted = rateComparison.formatRateComparison(comparison, { showAll: true });
      
      assert.ok(formatted.includes('All Options'));
    });
    
    it('should handle empty comparison', () => {
      const comparison = {
        recommendation: null,
        cheapest: null,
        bestValue: null,
        mostFlexible: null,
        allRates: []
      };
      
      const formatted = rateComparison.formatRateComparison(comparison);
      
      assert.ok(typeof formatted === 'string');
    });
  });
  
  describe('createRateTable', () => {
    it('should create table structure', () => {
      const rooms = [
        {
          name: 'Room 1',
          rates: [{ perNight: 100, total: 300, refundable: true, breakfastIncluded: false, freeCancellation: true }]
        }
      ];
      
      const table = rateComparison.createRateTable(rooms);
      
      assert.ok(table.headers);
      assert.ok(table.rows);
      assert.strictEqual(table.headers.length, 6);
    });
    
    it('should handle multiple rates per room', () => {
      const rooms = [
        {
          name: 'Room 1',
          rates: [
            { perNight: 100, total: 300, refundable: true, breakfastIncluded: false, freeCancellation: true },
            { perNight: 120, total: 360, refundable: false, breakfastIncluded: true, freeCancellation: false }
          ]
        }
      ];
      
      const table = rateComparison.createRateTable(rooms);
      
      assert.strictEqual(table.rows.length, 2);
    });
    
    it('should handle rooms without rates', () => {
      const rooms = [
        { name: 'Room 1', rates: [] }
      ];
      
      const table = rateComparison.createRateTable(rooms);
      
      assert.strictEqual(table.rows.length, 0);
    });
  });
  
  describe('formatRateTable', () => {
    it('should format table as text', () => {
      const table = {
        headers: ['Room', 'Price'],
        rows: [
          ['Room 1', '$100']
        ]
      };
      
      const formatted = rateComparison.formatRateTable(table);
      
      assert.ok(formatted.includes('Room'));
      assert.ok(formatted.includes('Price'));
      assert.ok(formatted.includes('Room 1'));
    });
    
    it('should create box-drawing table', () => {
      const table = {
        headers: ['A', 'B'],
        rows: [['1', '2']]
      };
      
      const formatted = rateComparison.formatRateTable(table);
      
      assert.ok(formatted.includes('┌'));
      assert.ok(formatted.includes('┐'));
      assert.ok(formatted.includes('└'));
      assert.ok(formatted.includes('┘'));
    });
  });
  
  describe('highlightRateDifferences', () => {
    it('should calculate price range', () => {
      const rooms = [
        { name: 'Room 1', rates: [{ perNight: 100 }] },
        { name: 'Room 2', rates: [{ perNight: 200 }] }
      ];
      
      const differences = rateComparison.highlightRateDifferences(rooms);
      
      assert.strictEqual(differences.priceRange.min, 100);
      assert.strictEqual(differences.priceRange.max, 200);
      assert.strictEqual(differences.priceRange.diff, 100);
    });
    
    it('should count refundable rates', () => {
      const rooms = [
        { name: 'Room 1', rates: [{ perNight: 100, refundable: true }] },
        { name: 'Room 2', rates: [{ perNight: 150, refundable: false }] }
      ];
      
      const differences = rateComparison.highlightRateDifferences(rooms);
      
      assert.strictEqual(differences.refundableCount, 1);
    });
    
    it('should count breakfast included', () => {
      const rooms = [
        { name: 'Room 1', rates: [{ perNight: 100, breakfastIncluded: true }] },
        { name: 'Room 2', rates: [{ perNight: 150, breakfastIncluded: false }] }
      ];
      
      const differences = rateComparison.highlightRateDifferences(rooms);
      
      assert.strictEqual(differences.breakfastCount, 1);
    });
    
    it('should count free cancellation', () => {
      const rooms = [
        { name: 'Room 1', rates: [{ perNight: 100, freeCancellation: true }] },
        { name: 'Room 2', rates: [{ perNight: 150, freeCancellation: true }] }
      ];
      
      const differences = rateComparison.highlightRateDifferences(rooms);
      
      assert.strictEqual(differences.freeCancellationCount, 2);
    });
  });

});
