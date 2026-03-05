#!/usr/bin/env node

/**
 * Payment Handoff for booking.com
 * Navigates to payment page and hands off to user for completion
 * 
 * Usage:
 *   const { navigateToPayment, capturePaymentSummary, handoffToUser } = require('./payment-handoff.js');
 *   const result = await navigateToPayment(browser);
 *   await handoffToUser(result);
 */

/**
 * Navigate to payment page and verify
 * @param {Object} browser - Browser automation interface
 * @returns {Promise<Object>} Payment page info
 */
async function navigateToPayment(browser) {
  try {
    console.log('💳 Navigating to payment page...');
    
    const result = {
      success: false,
      onPaymentPage: false,
      bookingSummary: null,
      totalPrice: null,
      paymentMethods: [],
      timestamp: new Date().toISOString()
    };
    
    // Get page snapshot
    const snapshot = await browser.snapshot({
      profile: 'chrome',
      refs: 'aria'
    });
    
    if (!snapshot) {
      throw new Error('Failed to get page snapshot');
    }
    
    // Verify we're on payment page
    const isPaymentPage = snapshot.includes('Payment') || 
                         snapshot.includes('payment details') ||
                         snapshot.includes('Credit card') ||
                         snapshot.includes('Debit card') ||
                         snapshot.includes('Complete booking');
    
    if (!isPaymentPage) {
      throw new Error('Not on payment page - may need to complete previous steps first');
    }
    
    result.onPaymentPage = true;
    
    // Extract booking summary
    result.bookingSummary = extractBookingSummary(snapshot);
    
    // Extract total price
    result.totalPrice = extractTotalPrice(snapshot);
    
    // Extract available payment methods
    result.paymentMethods = extractPaymentMethods(snapshot);
    
    result.success = true;
    
    console.log('✅ On payment page');
    console.log(`   Total: ${result.totalPrice || 'Not found'}`);
    console.log(`   Payment methods: ${result.paymentMethods.length} available`);
    
    return result;
    
  } catch (error) {
    console.error('❌ Error navigating to payment:', error.message);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Extract booking summary from payment page
 */
function extractBookingSummary(snapshot) {
  const summary = {
    hotelName: null,
    checkIn: null,
    checkOut: null,
    nights: null,
    rooms: null,
    guests: null
  };
  
  // Extract hotel name
  const hotelMatch = snapshot.match(/(?:Hotel|Hôtel|Property|Booking for) [^,\n]+/i);
  if (hotelMatch) {
    summary.hotelName = hotelMatch[0].trim();
  }
  
  // Extract dates
  const dateMatch = snapshot.match(/(\w+ \d{1,2},? \d{4})/i);
  if (dateMatch) {
    summary.checkIn = dateMatch[1];
  }
  
  // Extract nights
  const nightsMatch = snapshot.match(/(\d+) night/i);
  if (nightsMatch) {
    summary.nights = parseInt(nightsMatch[1]);
  }
  
  // Extract rooms
  const roomsMatch = snapshot.match(/(\d+) room/i);
  if (roomsMatch) {
    summary.rooms = parseInt(roomsMatch[1]);
  }
  
  // Extract guests
  const guestsMatch = snapshot.match(/(\d+) guest/i);
  if (guestsMatch) {
    summary.guests = parseInt(guestsMatch[1]);
  }
  
  return summary;
}

/**
 * Extract total price from payment page
 */
function extractTotalPrice(snapshot) {
  // Look for total price patterns
  const patterns = [
    /Total[:\s]*([A-Z]{3})?\s*([\d,]+\.?\d*)/i,
    /Grand total[:\s]*([A-Z]{3})?\s*([\d,]+\.?\d*)/i,
    /Amount to pay[:\s]*([A-Z]{3})?\s*([\d,]+\.?\d*)/i,
    /([A-Z]{3})?\s*([\d,]+\.?\d*)\s*total/i
  ];
  
  for (const pattern of patterns) {
    const match = snapshot.match(pattern);
    if (match) {
      const currency = match[1] || 'USD';
      const amount = match[2].replace(/,/g, '');
      return {
        amount: parseFloat(amount),
        currency: currency,
        formatted: `${currency} ${match[2]}`
      };
    }
  }
  
  return null;
}

/**
 * Extract available payment methods
 */
function extractPaymentMethods(snapshot) {
  const methods = [];
  
  // Check for common payment methods
  const methodPatterns = {
    'Credit Card': /credit card|Visa|Mastercard|American Express/i,
    'Debit Card': /debit card/i,
    'PayPal': /PayPal/i,
    'Apple Pay': /Apple Pay/i,
    'Google Pay': /Google Pay/i,
    'Bank Transfer': /bank transfer|wire transfer/i,
    'Cash': /pay at property|cash/i
  };
  
  for (const [method, pattern] of Object.entries(methodPatterns)) {
    if (pattern.test(snapshot)) {
      methods.push(method);
    }
  }
  
  return methods.length > 0 ? methods : ['Credit Card'];
}

/**
 * Select a payment method
 * @param {Object} browser - Browser automation interface
 * @param {string} method - Payment method to select
 * @returns {Promise<Object>} Result
 */
async function selectPaymentMethod(browser, method) {
  try {
    console.log(`💳 Selecting payment method: ${method}`);
    
    const snapshot = await browser.snapshot({
      profile: 'chrome',
      refs: 'aria'
    });
    
    if (!snapshot || !snapshot.elements) {
      throw new Error('Failed to get page snapshot');
    }
    
    // Find the payment method option
    const methodOption = findPaymentMethodOption(snapshot.elements, method);
    
    if (!methodOption || !methodOption.ref) {
      console.warn(`  ⚠️  Payment method "${method}" not found, using default`);
      return {
        success: false,
        error: `Payment method "${method}" not available`,
        timestamp: new Date().toISOString()
      };
    }
    
    console.log(`  🎯 Clicking payment method (ref: ${methodOption.ref})`);
    
    await browser.act({
      profile: 'chrome',
      request: {
        kind: 'click',
        ref: methodOption.ref
      }
    });
    
    await sleep(500);
    
    return {
      success: true,
      method: method,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error selecting payment method:', error.message);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Find payment method option from elements
 * @param {Array} elements - Snapshot elements
 * @param {string} method - Payment method name
 * @returns {Object|null} Payment option element
 */
function findPaymentMethodOption(elements, method) {
  for (const element of elements) {
    // Look for radio button or checkbox with payment method name
    if (element.role === 'radio' || element.role === 'checkbox' || element.role === 'button') {
      const name = element.name || '';
      if (name.toLowerCase().includes(method.toLowerCase())) {
        return element;
      }
    }
    
    // Also check group elements
    if (element.role === 'group' || element.role === 'radiogroup') {
      const groupName = element.name || '';
      if (groupName.toLowerCase().includes('payment')) {
        const found = findPaymentMethodOption(element.children || [], method);
        if (found) return found;
      }
    }
    
    if (element.children) {
      const found = findPaymentMethodOption(element.children, method);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Capture payment page summary for user
 */
function capturePaymentSummary(paymentInfo) {
  const lines = [];
  
  lines.push('💳 **PAYMENT PAGE READY**');
  lines.push('');
  
  // Booking Summary
  if (paymentInfo.bookingSummary) {
    lines.push('📋 **Booking Summary:**');
    if (paymentInfo.bookingSummary.hotelName) {
      lines.push(`   🏨 ${paymentInfo.bookingSummary.hotelName}`);
    }
    if (paymentInfo.bookingSummary.checkIn) {
      lines.push(`   📅 Check-in: ${paymentInfo.bookingSummary.checkIn}`);
    }
    if (paymentInfo.bookingSummary.nights) {
      lines.push(`   🌙 ${paymentInfo.bookingSummary.nights} nights`);
    }
    if (paymentInfo.bookingSummary.rooms) {
      lines.push(`   🚪 ${paymentInfo.bookingSummary.rooms} room(s)`);
    }
    if (paymentInfo.bookingSummary.guests) {
      lines.push(`   👥 ${paymentInfo.bookingSummary.guests} guest(s)`);
    }
    lines.push('');
  }
  
  // Total Price
  if (paymentInfo.totalPrice) {
    lines.push('💰 **Total Price:**');
    lines.push(`   ${paymentInfo.totalPrice.formatted}`);
    lines.push('');
  }
  
  // Payment Methods
  if (paymentInfo.paymentMethods && paymentInfo.paymentMethods.length > 0) {
    lines.push('💳 **Payment Methods Available:**');
    paymentInfo.paymentMethods.forEach(method => {
      lines.push(`   • ${method}`);
    });
    lines.push('');
  }
  
  return lines.join('\n');
}

/**
 * Hand off to user for payment completion
 */
async function handoffToUser(paymentInfo, options = {}) {
  const summary = capturePaymentSummary(paymentInfo);
  
  console.log('\n' + '='.repeat(60));
  console.log(summary);
  console.log('='.repeat(60));
  console.log('');
  console.log('✅ **Payment page is ready!**');
  console.log('');
  console.log('👤 **Next Steps:**');
  console.log('   1. Review booking summary above');
  console.log('   2. Enter your payment details');
  console.log('   3. Complete the booking');
  console.log('');
  console.log('💡 **Tips:**');
  console.log('   • Double-check all booking details before paying');
  console.log('   • Ensure payment info matches your card');
  console.log('   • Save confirmation email after booking');
  console.log('');
  
  if (options.waitForConfirmation) {
    console.log('⏳ Waiting for booking confirmation...');
    console.log('   (Say "done" when you\'ve completed the booking)');
  }
  
  return {
    success: true,
    message: 'Payment page ready for user completion',
    summary: summary,
    waitForConfirmation: options.waitForConfirmation || false,
    timestamp: new Date().toISOString()
  };
}

/**
 * Wait for and capture booking confirmation
 */
async function waitForConfirmation(browser, timeout = 300000) {
  try {
    console.log('⏳ Waiting for booking confirmation...');
    
    const start = Date.now();
    
    while (Date.now() - start < timeout) {
      const snapshot = await browser.snapshot({
        profile: 'chrome',
        refs: 'aria'
      });
      
      if (!snapshot) {
        await sleep(2000);
        continue;
      }
      
      // Check for confirmation indicators
      const isConfirmed = snapshot.includes('Booking confirmed') ||
                         snapshot.includes('Confirmation') ||
                         snapshot.includes('Booking number') ||
                         snapshot.includes('Reservation confirmed') ||
                         snapshot.includes('Thank you for booking');
      
      if (isConfirmed) {
        const confirmation = extractConfirmation(snapshot);
        console.log('✅ Booking confirmed!');
        return {
          success: true,
          confirmed: true,
          confirmation: confirmation,
          timestamp: new Date().toISOString()
        };
      }
      
      await sleep(3000);
    }
    
    console.log('⏰ Timeout waiting for confirmation');
    return {
      success: true,
      confirmed: false,
      error: 'Timeout waiting for confirmation',
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error waiting for confirmation:', error.message);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Extract confirmation details
 */
function extractConfirmation(snapshot) {
  const confirmation = {
    bookingNumber: null,
    hotelName: null,
    checkIn: null,
    checkOut: null,
    totalPrice: null
  };
  
  // Extract booking number
  const bookingNumMatch = snapshot.match(/(?:Booking number|Reservation|Confirmation number)[:\s]*([A-Z0-9-]+)/i);
  if (bookingNumMatch) {
    confirmation.bookingNumber = bookingNumMatch[1];
  }
  
  // Extract hotel name
  const hotelMatch = snapshot.match(/(?:Hotel|Hôtel|Property) [^,\n]+/i);
  if (hotelMatch) {
    confirmation.hotelName = hotelMatch[0].trim();
  }
  
  // Extract dates
  const dateMatch = snapshot.match(/(\w+ \d{1,2},? \d{4})/i);
  if (dateMatch) {
    confirmation.checkIn = dateMatch[1];
  }
  
  return confirmation;
}

/**
 * Format confirmation for display
 */
function formatConfirmation(confirmation) {
  const lines = [];
  
  lines.push('🎉 **BOOKING CONFIRMED!**');
  lines.push('');
  
  if (confirmation.bookingNumber) {
    lines.push(`📋 **Booking Number:** ${confirmation.bookingNumber}`);
    lines.push('');
  }
  
  lines.push('🏨 **Property Details:**');
  if (confirmation.hotelName) {
    lines.push(`   ${confirmation.hotelName}`);
  }
  if (confirmation.checkIn) {
    lines.push(`   Check-in: ${confirmation.checkIn}`);
  }
  if (confirmation.checkOut) {
    lines.push(`   Check-out: ${confirmation.checkOut}`);
  }
  lines.push('');
  
  lines.push('📧 **Next Steps:**');
  lines.push('   • Check your email for confirmation');
  lines.push('   • Save booking number for check-in');
  lines.push('   • Contact property directly for special requests');
  lines.push('');
  
  return lines.join('\n');
}

/**
 * Sleep helper
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Export for use in other modules
module.exports = {
  navigateToPayment,
  capturePaymentSummary,
  handoffToUser,
  waitForConfirmation,
  extractConfirmation,
  formatConfirmation,
  extractBookingSummary,
  extractTotalPrice,
  extractPaymentMethods,
  selectPaymentMethod
};

// CLI mode for testing
if (require.main === module) {
  console.log('Payment Handoff Module');
  console.log('\nUsage:');
  console.log('  const { navigateToPayment, handoffToUser } = require("./payment-handoff.js");');
  console.log('  const paymentInfo = await navigateToPayment(browser);');
  console.log('  await handoffToUser(paymentInfo);');
  console.log('\nOptional: Wait for confirmation');
  console.log('  const confirmation = await waitForConfirmation(browser);');
  console.log('  console.log(formatConfirmation(confirmation));');
}
