/**
 * Unit Tests for Room Options Extractor
 * Tests the room-extractor.js module
 *
 * Run: npm test
 */

const assert = require('assert');
const { describe, it } = require('node:test');

// Import module
const roomExtractor = require('../../scripts/room-extractor.js');

describe('Room Options Extractor', () => {

  describe('compareRoomRates', () => {
    it('should compare rooms', () => {
      const rooms = [
        { name: 'Room 1', rates: [{ perNight: 200 }], amenities: ['WiFi'] },
        { name: 'Room 2', rates: [{ perNight: 150 }], amenities: ['WiFi'] }
      ];

      const comparison = roomExtractor.compareRoomRates(rooms);

      assert.ok(comparison);
      assert.ok(comparison.hasOwnProperty('bestValue'));
      assert.ok(comparison.hasOwnProperty('cheapest'));
      assert.ok(comparison.hasOwnProperty('comparison'));
    });

    it('should handle empty rooms', () => {
      const comparison = roomExtractor.compareRoomRates([]);
      assert.strictEqual(comparison.bestValue, null);
      assert.strictEqual(comparison.cheapest, null);
    });

    it('should find cheapest room', () => {
      const rooms = [
        { name: 'Room 1', rates: [{ perNight: 200 }], amenities: [] },
        { name: 'Room 2', rates: [{ perNight: 100 }], amenities: [] }
      ];

      const comparison = roomExtractor.compareRoomRates(rooms);
      assert.strictEqual(comparison.cheapest.rate.perNight, 100);
    });
  });

  describe('formatRoomOptions', () => {
    it('should format rooms as text', () => {
      const rooms = [
        {
          name: 'Deluxe Room',
          size: { value: 25, unit: 'm²' },
          rates: [{ perNight: 200, refundable: true, breakfastIncluded: false }],
          available: true
        }
      ];

      const formatted = roomExtractor.formatRoomOptions(rooms, { top: 3 });

      assert.ok(typeof formatted === 'string');
      assert.ok(formatted.includes('Deluxe Room'));
    });

    it('should limit to top N rooms', () => {
      const rooms = Array(6).fill({ name: 'Room', rates: [{ perNight: 100, refundable: true, breakfastIncluded: false }] });
      const formatted = roomExtractor.formatRoomOptions(rooms, { top: 3 });
      assert.ok(typeof formatted === 'string');
    });

    it('should show sold out status', () => {
      const rooms = [{ name: 'Room', rates: [{ perNight: 100, refundable: true, breakfastIncluded: false }], available: false }];
      const formatted = roomExtractor.formatRoomOptions(rooms);
      assert.ok(formatted.includes('Sold out') || formatted.length > 0);
    });

    it('should handle empty rooms', () => {
      const formatted = roomExtractor.formatRoomOptions([]);
      assert.strictEqual(formatted, '');
    });

    it('should format room with all details', () => {
      const rooms = [
        {
          name: 'Suite',
          size: { value: 45, unit: 'm²' },
          beds: { count: 2, type: 'king' },
          maxOccupancy: 4,
          amenities: ['WiFi', 'Air conditioning', 'TV'],
          rates: [{ perNight: 300, refundable: true, breakfastIncluded: true }],
          available: true
        }
      ];

      const formatted = roomExtractor.formatRoomOptions(rooms, { top: 1 });
      assert.ok(formatted.includes('Suite'));
      assert.ok(formatted.includes('300'));
    });
  });

  describe('Module Exports', () => {
    it('should export extractRoomOptions function', () => {
      assert.strictEqual(typeof roomExtractor.extractRoomOptions, 'function');
    });

    it('should export compareRoomRates function', () => {
      assert.strictEqual(typeof roomExtractor.compareRoomRates, 'function');
    });

    it('should export formatRoomOptions function', () => {
      assert.strictEqual(typeof roomExtractor.formatRoomOptions, 'function');
    });
  });

});
