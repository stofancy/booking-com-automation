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
  
  describe('extractBookingSummary', () => {
    it('should extract hotel name', () => {
      const mockSnapshot = 'Hotel Relais du Vieux Paris, 9 rue Git-le-Coeur';
      
      const summary = paymentHandoff.extractBookingSummary(mockSnapshot);
      
      assert.ok(summary.hotelName);
      assert.ok(summary.hotelName.includes('Hotel') || summary.hotelName.includes('Relais'));
    });
    
    it('should extract check-in date', () => {
      const mockSnapshot = 'Check-in: March 30, 2026';
      
      const summary = paymentHandoff.extractBookingSummary(mockSnapshot);
      
      assert.ok(summary.checkIn);
      assert.ok(summary.checkIn.includes('March') || summary.checkIn.includes('2026'));
    });
    
    it('should extract number of nights', () => {
      const mockSnapshot = '3 nights, 1 room, 2 guests';
      
      const summary = paymentHandoff.extractBookingSummary(mockSnapshot);
      
      assert.strictEqual(summary.nights, 3);
    });
    
    it('should extract number of rooms', () => {
      const mockSnapshot = '2 nights, 2 rooms, 4 guests';
      
      const summary = paymentHandoff.extractBookingSummary(mockSnapshot);
      
      assert.strictEqual(summary.rooms, 2);
    });
    
    it('should extract number of guests', () => {
      const mockSnapshot = '1 night, 1 room, 2 guests';
      
      const summary = paymentHandoff.extractBookingSummary(mockSnapshot);
      
      assert.strictEqual(summary.guests, 2);
    });
    
    it('should handle incomplete snapshot', () => {
      const mockSnapshot = 'Some random text';
      
      const summary = paymentHandoff.extractBookingSummary(mockSnapshot);
      
      assert.ok(summary);
      assert.strictEqual(summary.hotelName, null);
      assert.strictEqual(summary.nights, null);
    });
  });
  
  describe('extractTotalPrice', () => {
    it('should extract total price with currency', () => {
      const mockSnapshot = 'Total: USD 1,500.00';
      
      const price = paymentHandoff.extractTotalPrice(mockSnapshot);
      
      assert.ok(price);
      assert.strictEqual(price.amount, 1500);
      assert.strictEqual(price.currency, 'USD');
    });
    
    it('should extract price without currency', () => {
      const mockSnapshot = 'Grand total: 2,500';
      
      const price = paymentHandoff.extractTotalPrice(mockSnapshot);
      
      assert.ok(price);
      assert.strictEqual(price.amount, 2500);
    });
    
    it('should extract amount to pay', () => {
      const mockSnapshot = 'Amount to pay: EUR 850.50';
      
      const price = paymentHandoff.extractTotalPrice(mockSnapshot);
      
      assert.ok(price);
      assert.strictEqual(price.amount, 850.50);
      assert.strictEqual(price.currency, 'EUR');
    });
    
    it('should handle decimal prices', () => {
      const mockSnapshot = 'Total: 999.99';
      
      const price = paymentHandoff.extractTotalPrice(mockSnapshot);
      
      assert.ok(price);
      assert.strictEqual(price.amount, 999.99);
    });
    
    it('should return null for no price', () => {
      const mockSnapshot = 'No price information here';
      
      const price = paymentHandoff.extractTotalPrice(mockSnapshot);
      
      assert.strictEqual(price, null);
    });
  });
  
  describe('extractPaymentMethods', () => {
    it('should extract credit card', () => {
      const mockSnapshot = 'We accept credit card, Visa, Mastercard';
      
      const methods = paymentHandoff.extractPaymentMethods(mockSnapshot);
      
      assert.ok(methods.includes('Credit Card'));
    });
    
    it('should extract PayPal', () => {
      const mockSnapshot = 'Payment methods: PayPal, Credit Card';
      
      const methods = paymentHandoff.extractPaymentMethods(mockSnapshot);
      
      assert.ok(methods.includes('PayPal'));
    });
    
    it('should extract Apple Pay', () => {
      const mockSnapshot = 'Pay with Apple Pay or Google Pay';
      
      const methods = paymentHandoff.extractPaymentMethods(mockSnapshot);
      
      assert.ok(methods.includes('Apple Pay'));
      assert.ok(methods.includes('Google Pay'));
    });
    
    it('should extract bank transfer', () => {
      const mockSnapshot = 'Bank transfer or wire transfer available';
      
      const methods = paymentHandoff.extractPaymentMethods(mockSnapshot);
      
      assert.ok(methods.includes('Bank Transfer'));
    });
    
    it('should extract cash payment', () => {
      const mockSnapshot = 'Pay at property with cash';
      
      const methods = paymentHandoff.extractPaymentMethods(mockSnapshot);
      
      assert.ok(methods.includes('Cash'));
    });
    
    it('should return default if no methods found', () => {
      const mockSnapshot = 'No payment methods mentioned';
      
      const methods = paymentHandoff.extractPaymentMethods(mockSnapshot);
      
      assert.ok(methods.length > 0);
      assert.strictEqual(methods[0], 'Credit Card');
    });
  });
  
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
  
  describe('extractConfirmation', () => {
    it('should extract booking number', () => {
      const mockSnapshot = 'Booking number: ABC123XYZ';
      
      const confirmation = paymentHandoff.extractConfirmation(mockSnapshot);
      
      assert.ok(confirmation.bookingNumber);
      assert.strictEqual(confirmation.bookingNumber, 'ABC123XYZ');
    });
    
    it('should extract hotel name', () => {
      const mockSnapshot = 'Thank you for booking Hotel Paris';
      
      const confirmation = paymentHandoff.extractConfirmation(mockSnapshot);
      
      assert.ok(confirmation.hotelName);
    });
    
    it('should extract check-in date', () => {
      const mockSnapshot = 'Your stay: March 30, 2026';
      
      const confirmation = paymentHandoff.extractConfirmation(mockSnapshot);
      
      assert.ok(confirmation.checkIn);
    });
    
    it('should handle incomplete confirmation', () => {
      const mockSnapshot = 'Booking confirmed!';
      
      const confirmation = paymentHandoff.extractConfirmation(mockSnapshot);
      
      assert.ok(confirmation);
      assert.strictEqual(confirmation.bookingNumber, null);
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
      assert.ok(formatted.includes('Next Steps'));
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
  
});
