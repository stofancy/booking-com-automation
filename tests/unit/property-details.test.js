/**
 * Unit Tests for Property Details Extractor
 * Tests the property-details.js module
 *
 * Run: npm test
 */

const assert = require('assert');
const { describe, it } = require('node:test');

// Import module
const propertyDetails = require('../../scripts/property-details.js');

describe('Property Details Extractor', () => {

  describe('formatPropertyDetails', () => {
    it('should format complete property details', () => {
      const details = {
        name: 'Hotel Paris',
        starRating: 4,
        guestScore: 9.2,
        reviewCount: 1234,
        location: 'Paris, France',
        amenities: ['Free WiFi', 'Breakfast', 'Gym'],
        checkInTime: '3:00 PM',
        checkOutTime: '11:00 AM',
        cancellationPolicy: 'Free cancellation'
      };

      const formatted = propertyDetails.formatPropertyDetails(details);

      assert.ok(formatted.includes('Hotel Paris'));
      assert.ok(formatted.includes('Free WiFi'));
      assert.ok(formatted.includes('3:00 PM'));
      assert.ok(formatted.includes('Free cancellation'));
    });

    it('should format minimal property details', () => {
      const details = {
        name: 'Simple Hotel'
      };

      const formatted = propertyDetails.formatPropertyDetails(details);

      assert.ok(formatted.includes('Simple Hotel'));
    });

    it('should handle null details gracefully', () => {
      const details = {
        name: null,
        starRating: null,
        amenities: []
      };

      const formatted = propertyDetails.formatPropertyDetails(details);

      assert.ok(typeof formatted === 'string');
    });

    it('should display guest score', () => {
      const details = {
        name: 'Test Hotel',
        guestScore: 8.5,
        reviewCount: 500
      };

      const formatted = propertyDetails.formatPropertyDetails(details);
      assert.ok(formatted.includes('8.5'));
    });

    it('should display location info', () => {
      const details = {
        name: 'Test Hotel',
        location: 'Downtown',
        distanceFromCenter: '0.5km from center'
      };

      const formatted = propertyDetails.formatPropertyDetails(details);
      assert.ok(formatted.includes('Downtown'));
      assert.ok(formatted.includes('0.5km'));
    });
  });

  describe('Module Exports', () => {
    it('should export extractPropertyDetails function', () => {
      assert.strictEqual(typeof propertyDetails.extractPropertyDetails, 'function');
    });

    it('should export formatPropertyDetails function', () => {
      assert.strictEqual(typeof propertyDetails.formatPropertyDetails, 'function');
    });
  });

});
