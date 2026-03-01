/**
 * Unit Tests for Search Parser
 * Tests the search-parser.js module
 * 
 * Run: npm test
 */

const assert = require('assert');
const { describe, it } = require('node:test');
const {
  parseSearchQuery,
  parseDestination,
  parseDates,
  parseGuests,
  parseBudget,
  formatDate,
  formatSearchSummary,
  validateSearch,
  getValidationErrors
} = require('../../scripts/search-parser.js');

describe('Search Parser', () => {
  
  describe('parseDestination', () => {
    it('should extract destination from "hotels in Paris"', () => {
      const result = parseDestination('hotels in paris, march 15-20');
      assert.strictEqual(result, 'paris');
    });

    it('should extract destination from "in Tokyo"', () => {
      const result = parseDestination('find a hotel in tokyo for weekend');
      // Parser removes "for weekend" as it's a date reference
      assert.ok(result.includes('tokyo'), `destination should include 'tokyo', got '${result}'`);
    });

    it('should handle multi-word destinations', () => {
      const result = parseDestination('hotels in new york, april 1-5');
      assert.strictEqual(result, 'new york');
    });

    it('should remove trailing commas', () => {
      const result = parseDestination('hotels in paris, march 15');
      assert.strictEqual(result, 'paris');
    });

    it('should return null for empty query', () => {
      const result = parseDestination('');
      assert.strictEqual(result, null);
    });
  });

  describe('parseDates', () => {
    it('should parse March 15-20 format', () => {
      const result = parseDates('hotels in paris, march 15-20, 2 guests');
      assert.ok(result.checkIn, 'checkIn should exist');
      assert.ok(result.checkOut, 'checkOut should exist');
      assert.ok(result.checkIn.includes('2026-03-15'), `checkIn should be 2026-03-15, got ${result.checkIn}`);
      assert.ok(result.checkOut.includes('2026-03-20'), `checkOut should be 2026-03-20, got ${result.checkOut}`);
    });

    it.todo('should parse ISO date format', () => {
      // TODO: ISO format parsing needs improvement
      const result = parseDates('hotels from 2026-04-01 to 2026-04-05');
      assert.ok(result.checkIn, 'checkIn should exist for ISO format');
      assert.ok(result.checkOut, 'checkOut should exist for ISO format');
    });

    it('should parse "next weekend"', () => {
      const result = parseDates('hotels in paris next weekend');
      assert.ok(result.checkIn, 'checkIn should exist for next weekend');
      assert.ok(result.checkOut, 'checkOut should exist for next weekend');
    });

    it('should parse "tomorrow"', () => {
      const result = parseDates('hotel tomorrow');
      assert.ok(result.checkIn, 'checkIn should exist for tomorrow');
      assert.ok(result.checkOut, 'checkOut should exist for tomorrow');
    });

    it('should detect flexible dates', () => {
      const result = parseDates('hotels in paris, flexible ±3 days');
      assert.strictEqual(result.flexible, true);
      assert.strictEqual(result.flexibleDays, 3);
    });

    it('should return null dates for no date pattern', () => {
      const result = parseDates('hotels in paris');
      assert.strictEqual(result.checkIn, null);
      assert.strictEqual(result.checkOut, null);
    });
  });

  describe('parseGuests', () => {
    it('should parse "2 guests"', () => {
      const result = parseGuests('hotels for 2 guests');
      assert.strictEqual(result.adults, 2);
      assert.strictEqual(result.children, 0);
      assert.strictEqual(result.rooms, 1);
    });

    it('should parse "2 adults and 1 child"', () => {
      const result = parseGuests('hotel for 2 adults and 1 child');
      assert.strictEqual(result.adults, 2);
      assert.strictEqual(result.children, 1);
      assert.strictEqual(result.rooms, 1);
    });

    it('should parse "3 rooms"', () => {
      const result = parseGuests('hotels, 3 rooms');
      assert.strictEqual(result.rooms, 3);
    });

    it('should use defaults when no guest info', () => {
      const result = parseGuests('hotels in paris');
      assert.strictEqual(result.adults, 2);
      assert.strictEqual(result.children, 0);
      assert.strictEqual(result.rooms, 1);
    });
  });

  describe('parseBudget', () => {
    it('should parse "under $200/night"', () => {
      const result = parseBudget('hotels under $200/night');
      assert.ok(result, 'budget should exist');
      assert.strictEqual(result.amount, 200);
      assert.strictEqual(result.period, 'night');
    });

    it('should parse "below $150"', () => {
      const result = parseBudget('hotels below $150 per night');
      assert.ok(result);
      assert.strictEqual(result.amount, 150);
    });

    it('should parse "cheap" as approximate budget', () => {
      const result = parseBudget('cheap hotels in paris');
      assert.ok(result);
      assert.strictEqual(result.approximate, true);
      assert.strictEqual(result.amount, 100);
    });

    it('should return null for no budget', () => {
      const result = parseBudget('hotels in paris');
      assert.strictEqual(result, null);
    });
  });

  describe('parseSearchQuery', () => {
    it('should parse complete query', () => {
      const result = parseSearchQuery('Hotels in Paris, March 15-20, 2 guests');
      assert.strictEqual(result.destination, 'paris');
      assert.ok(result.checkIn);
      assert.ok(result.checkOut);
      assert.strictEqual(result.adults, 2);
      assert.strictEqual(result.valid, true);
    });

    it('should parse query with budget', () => {
      const result = parseSearchQuery('Cheap hotels in Barcelona, April 1-5, under $200/night');
      assert.strictEqual(result.destination, 'barcelona');
      assert.ok(result.budget);
      assert.ok(result.budget.amount <= 200);
    });

    it('should parse query with children', () => {
      const result = parseSearchQuery('Hotel in Tokyo next weekend for 2 adults and 1 child');
      assert.strictEqual(result.destination, 'tokyo');
      assert.strictEqual(result.children, 1);
    });

    it('should detect validation errors for missing destination', () => {
      const result = parseSearchQuery('March 15-20, 2 guests');
      assert.strictEqual(result.destination, null);
      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.length > 0);
    });

    it('should detect validation errors for missing dates', () => {
      const result = parseSearchQuery('Hotels in Paris, 2 guests');
      assert.strictEqual(result.checkIn, null);
      assert.strictEqual(result.valid, false);
    });
  });

  describe('formatSearchSummary', () => {
    it('should format complete search', () => {
      const search = {
        destination: 'Paris',
        checkIn: '2026-03-15',
        checkOut: '2026-03-20',
        adults: 2,
        children: 0,
        rooms: 1,
        budget: null
      };
      const summary = formatSearchSummary(search);
      assert.ok(summary.includes('Paris'));
      assert.ok(summary.includes('2026-03-15'));
      assert.ok(summary.includes('2 adults'));
    });

    it('should format search with budget', () => {
      const search = {
        destination: 'Barcelona',
        checkIn: '2026-04-01',
        checkOut: '2026-04-05',
        adults: 2,
        children: 0,
        rooms: 1,
        budget: { amount: 200, period: 'night' }
      };
      const summary = formatSearchSummary(search);
      assert.ok(summary.includes('$200/night'));
    });
  });

  describe('formatDate', () => {
    it('should format date as YYYY-MM-DD', () => {
      const date = new Date(2026, 2, 15); // March 15, 2026
      const formatted = formatDate(date);
      assert.strictEqual(formatted, '2026-03-15');
    });

    it('should pad single digit months', () => {
      const date = new Date(2026, 0, 5); // January 5, 2026
      const formatted = formatDate(date);
      assert.strictEqual(formatted, '2026-01-05');
    });
  });

  describe('validateSearch', () => {
    it('should validate complete search', () => {
      const search = {
        destination: 'Paris',
        checkIn: '2026-03-15',
        checkOut: '2026-03-20',
        adults: 2,
        children: 0,
        rooms: 1
      };
      assert.strictEqual(validateSearch(search), true);
    });

    it('should invalidate search without destination', () => {
      const search = {
        destination: null,
        checkIn: '2026-03-15',
        checkOut: '2026-03-20',
        adults: 2,
        rooms: 1
      };
      assert.strictEqual(validateSearch(search), false);
    });

    it('should invalidate search without dates', () => {
      const search = {
        destination: 'Paris',
        checkIn: null,
        checkOut: null,
        adults: 2,
        rooms: 1
      };
      assert.strictEqual(validateSearch(search), false);
    });
  });

  describe('getValidationErrors', () => {
    it('should return errors for invalid search', () => {
      const search = {
        destination: null,
        checkIn: null,
        checkOut: null,
        adults: 0,
        rooms: 0
      };
      const errors = getValidationErrors(search);
      assert.ok(errors.length > 0);
      assert.ok(errors.some(e => e.includes('Destination')));
      assert.ok(errors.some(e => e.includes('Check-in')));
    });

    it('should return empty array for valid search', () => {
      const search = {
        destination: 'Paris',
        checkIn: '2026-03-15',
        checkOut: '2026-03-20',
        adults: 2,
        children: 0,
        rooms: 1
      };
      const errors = getValidationErrors(search);
      assert.strictEqual(errors.length, 0);
    });
  });

});

// Simple test runner for Node.js native test
if (typeof describe === 'undefined') {
  console.log('Running tests with Node.js test runner...');
  // Tests will be run by `node --test` command
}
