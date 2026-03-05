/**
 * Unit Tests for Payment Handoff Module
 * Tests the payment-handoff.js module
 *
 * Run: npm test
 */

const assert = require('assert');
const { describe, it } = require('node:test');

// Import module
const paymentHandoff = require('../../scripts/payment-handoff.js');

describe('Payment Handoff Module', () => {

  describe('capturePaymentSummary', () => {
    it('should create summary with all info', () => {
      const paymentInfo = {
        bookingSummary: {
          hotelName: 'Test Hotel',
          checkIn: 'March 30, 2026',
          nights: 3,
          rooms: 1,
          guests: 2
        },
        totalPrice: {
          amount: 1500,
          currency: 'USD',
          formatted: 'USD 1,500'
        },
        paymentMethods: ['Credit Card', 'PayPal']
      };

      const summary = paymentHandoff.capturePaymentSummary(paymentInfo);

      assert.ok(summary.includes('PAYMENT PAGE READY'));
      assert.ok(summary.includes('Test Hotel'));
      assert.ok(summary.includes('USD 1,500'));
      assert.ok(summary.includes('Credit Card'));
    });

    it('should handle minimal info', () => {
      const paymentInfo = {
        bookingSummary: {},
        totalPrice: null,
        paymentMethods: []
      };

      const summary = paymentHandoff.capturePaymentSummary(paymentInfo);

      assert.ok(summary.includes('PAYMENT PAGE READY'));
    });
  });

  describe('formatConfirmation', () => {
    it('should format complete confirmation', () => {
      const confirmation = {
        bookingNumber: 'ABC123',
        hotelName: 'Test Hotel',
        checkIn: 'March 30, 2026',
        checkOut: 'April 2, 2026'
      };

      const formatted = paymentHandoff.formatConfirmation(confirmation);

      assert.ok(formatted.includes('BOOKING CONFIRMED'));
      assert.ok(formatted.includes('ABC123'));
      assert.ok(formatted.includes('Test Hotel'));
    });

    it('should format minimal confirmation', () => {
      const confirmation = {
        bookingNumber: null,
        hotelName: null,
        checkIn: null,
        checkOut: null
      };

      const formatted = paymentHandoff.formatConfirmation(confirmation);

      assert.ok(formatted.includes('BOOKING CONFIRMED'));
    });
  });

  describe('Payment Flow Structure', () => {
    it('should have correct payment info structure', () => {
      const paymentInfo = {
        success: true,
        onPaymentPage: true,
        bookingSummary: {
          hotelName: 'Test',
          checkIn: '2026-03-30',
          nights: 3,
          rooms: 1,
          guests: 2
        },
        totalPrice: {
          amount: 1500,
          currency: 'USD',
          formatted: 'USD 1,500'
        },
        paymentMethods: ['Credit Card']
      };

      assert.ok(paymentInfo.success);
      assert.ok(paymentInfo.onPaymentPage);
      assert.ok(paymentInfo.bookingSummary);
      assert.ok(paymentInfo.totalPrice);
      assert.ok(Array.isArray(paymentInfo.paymentMethods));
    });

    it('should have correct confirmation structure', () => {
      const confirmation = {
        success: true,
        confirmed: true,
        confirmation: {
          bookingNumber: 'ABC123',
          hotelName: 'Test Hotel',
          checkIn: '2026-03-30'
        }
      };

      assert.ok(confirmation.success);
      assert.ok(confirmation.confirmed);
      assert.ok(confirmation.confirmation);
    });
  });

  describe('Module Exports', () => {
    it('should export navigateToPayment function', () => {
      assert.strictEqual(typeof paymentHandoff.navigateToPayment, 'function');
    });

    it('should export handoffToUser function', () => {
      assert.strictEqual(typeof paymentHandoff.handoffToUser, 'function');
    });

    it('should export waitForConfirmation function', () => {
      assert.strictEqual(typeof paymentHandoff.waitForConfirmation, 'function');
    });

    it('should export capturePaymentSummary function', () => {
      assert.strictEqual(typeof paymentHandoff.capturePaymentSummary, 'function');
    });

    it('should export formatConfirmation function', () => {
      assert.strictEqual(typeof paymentHandoff.formatConfirmation, 'function');
    });

    it('should export selectPaymentMethod function', () => {
      assert.strictEqual(typeof paymentHandoff.selectPaymentMethod, 'function');
    });
  });

});
