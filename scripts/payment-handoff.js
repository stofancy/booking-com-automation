#!/usr/bin/env node

/**
 * Payment Handoff for booking.com
 * Navigates to payment page and hands off to user for completion
 * Uses Playwright for browser automation
 *
 * Usage:
 *   const { navigateToPayment, capturePaymentSummary, handoffToUser } = require('./payment-handoff.js');
 *   const result = await navigateToPayment(page);
 *   await handoffToUser(result);
 */

/**
 * Navigate to payment page and verify
 * @param {Object} page - Playwright page object
 * @returns {Promise<Object>} Payment page info
 */
async function navigateToPayment(page) {
  try {
    console.log('Navigating to payment page...');

    const result = {
      success: false,
      onPaymentPage: false,
      bookingSummary: null,
      totalPrice: null,
      paymentMethods: [],
      timestamp: new Date().toISOString()
    };

    // Check URL
    const url = page.url();
    const isPaymentPage = url.includes('checkout') || url.includes('payment');

    if (!isPaymentPage) {
      throw new Error('Not on payment page - may need to complete previous steps first');
    }

    result.onPaymentPage = true;

    // Extract booking summary using page content
    result.bookingSummary = await extractBookingSummary(page);

    // Extract total price
    result.totalPrice = await extractTotalPrice(page);

    // Extract available payment methods
    result.paymentMethods = await extractPaymentMethods(page);

    result.success = true;

    console.log('On payment page');
    console.log(`   Total: ${result.totalPrice?.formatted || 'Not found'}`);
    console.log(`   Payment methods: ${result.paymentMethods.length} available`);

    return result;

  } catch (error) {
    console.error('Error navigating to payment:', error.message);
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
async function extractBookingSummary(page) {
  return await page.evaluate(() => {
    const summary = {
      hotelName: null,
      checkIn: null,
      checkOut: null,
      nights: null,
      rooms: null,
      guests: null
    };

    const text = document.body.innerText;

    // Extract hotel name
    const h1 = document.querySelector('h1');
    if (h1) {
      summary.hotelName = h1.textContent.trim();
    }

    // Extract nights
    const nightsMatch = text.match(/(\d+)\s*night/i);
    if (nightsMatch) {
      summary.nights = parseInt(nightsMatch[1]);
    }

    // Extract rooms
    const roomsMatch = text.match(/(\d+)\s*room/i);
    if (roomsMatch) {
      summary.rooms = parseInt(roomsMatch[1]);
    }

    // Extract guests
    const guestsMatch = text.match(/(\d+)\s*guest/i);
    if (guestsMatch) {
      summary.guests = parseInt(guestsMatch[1]);
    }

    return summary;
  });
}

/**
 * Extract total price from payment page
 */
async function extractTotalPrice(page) {
  return await page.evaluate(() => {
    const text = document.body.innerText;

    // Look for total price patterns
    const patterns = [
      /Total[:\s]*([A-Z]{3})?\s*([\d,]+\.?\d*)/i,
      /Grand total[:\s]*([A-Z]{3})?\s*([\d,]+\.?\d*)/i,
      /Amount to pay[:\s]*([A-Z]{3})?\s*([\d,]+\.?\d*)/i,
      /([A-Z]{3})?\s*([\d,]+\.?\d*)\s*total/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
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
  });
}

/**
 * Extract available payment methods
 */
async function extractPaymentMethods(page) {
  return await page.evaluate(() => {
    const methods = [];
    const text = document.body.innerText.toLowerCase();

    if (text.includes('credit card') || text.includes('visa') || text.includes('mastercard')) {
      methods.push('Credit Card');
    }
    if (text.includes('debit card')) {
      methods.push('Debit Card');
    }
    if (text.includes('paypal')) {
      methods.push('PayPal');
    }
    if (text.includes('apple pay')) {
      methods.push('Apple Pay');
    }
    if (text.includes('google pay')) {
      methods.push('Google Pay');
    }
    if (text.includes('bank transfer')) {
      methods.push('Bank Transfer');
    }
    if (text.includes('cash') || text.includes('pay at property')) {
      methods.push('Cash');
    }

    return methods.length > 0 ? methods : ['Credit Card'];
  });
}

/**
 * Select a payment method
 * @param {Object} page - Playwright page object
 * @param {string} method - Payment method to select
 * @returns {Promise<Object>} Result
 */
async function selectPaymentMethod(page, method) {
  try {
    console.log(`Selecting payment method: ${method}`);

    // Try to find payment method radio/button
    const selectors = [
      `input[value*="${method.toLowerCase()}"]`,
      `label:has-text("${method}")`,
      `button:has-text("${method}")`
    ];

    for (const selector of selectors) {
      const el = page.locator(selector).first();
      if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
        await el.click();
        await sleep(500);
        return {
          success: true,
          method: method,
          timestamp: new Date().toISOString()
        };
      }
    }

    console.warn(`Payment method "${method}" not found, using default`);
    return {
      success: false,
      error: `Payment method "${method}" not available`,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error selecting payment method:', error.message);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Capture payment page summary for user
 */
function capturePaymentSummary(paymentInfo) {
  const lines = [];

  lines.push('**PAYMENT PAGE READY**');
  lines.push('');

  if (paymentInfo.bookingSummary) {
    lines.push('**Booking Summary:**');
    if (paymentInfo.bookingSummary.hotelName) {
      lines.push(`   ${paymentInfo.bookingSummary.hotelName}`);
    }
    if (paymentInfo.bookingSummary.nights) {
      lines.push(`   ${paymentInfo.bookingSummary.nights} nights`);
    }
    if (paymentInfo.bookingSummary.rooms) {
      lines.push(`   ${paymentInfo.bookingSummary.rooms} room(s)`);
    }
    lines.push('');
  }

  if (paymentInfo.totalPrice) {
    lines.push('**Total Price:**');
    lines.push(`   ${paymentInfo.totalPrice.formatted}`);
    lines.push('');
  }

  if (paymentInfo.paymentMethods && paymentInfo.paymentMethods.length > 0) {
    lines.push('**Payment Methods Available:**');
    paymentInfo.paymentMethods.forEach(method => {
      lines.push(`   - ${method}`);
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

  console.log('\n' + '='.repeat(40));
  console.log(summary);
  console.log('='.repeat(40));
  console.log('');
  console.log('**Payment page is ready!**');
  console.log('');
  console.log('Next Steps:');
  console.log('   1. Review booking summary above');
  console.log('   2. Enter your payment details');
  console.log('   3. Complete the booking');
  console.log('');

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
async function waitForConfirmation(page, timeout = 300000) {
  try {
    console.log('Waiting for booking confirmation...');

    const start = Date.now();

    while (Date.now() - start < timeout) {
      const url = page.url();
      const text = document.body.innerText.toLowerCase();

      // Check for confirmation indicators
      const isConfirmed = url.includes('confirmation') ||
                         text.includes('booking confirmed') ||
                         text.includes('thank you') ||
                         text.includes('booking number');

      if (isConfirmed) {
        const confirmation = await extractConfirmation(page);
        console.log('Booking confirmed!');
        return {
          success: true,
          confirmed: true,
          confirmation: confirmation,
          timestamp: new Date().toISOString()
        };
      }

      await sleep(3000);
    }

    console.log('Timeout waiting for confirmation');
    return {
      success: true,
      confirmed: false,
      error: 'Timeout waiting for confirmation',
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error waiting for confirmation:', error.message);
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
async function extractConfirmation(page) {
  return await page.evaluate(() => {
    const text = document.body.innerText;
    const confirmation = {
      bookingNumber: null,
      hotelName: null,
      checkIn: null,
      checkOut: null
    };

    // Extract booking number
    const bookingNumMatch = text.match(/(?:Booking number|Confirmation)[:\s]*([A-Z0-9-]+)/i);
    if (bookingNumMatch) {
      confirmation.bookingNumber = bookingNumMatch[1];
    }

    // Extract hotel name
    const h1 = document.querySelector('h1');
    if (h1) {
      confirmation.hotelName = h1.textContent.trim();
    }

    return confirmation;
  });
}

/**
 * Format confirmation for display
 */
function formatConfirmation(confirmation) {
  const lines = [];

  lines.push('**BOOKING CONFIRMED!**');
  lines.push('');

  if (confirmation.bookingNumber) {
    lines.push(`**Booking Number:** ${confirmation.bookingNumber}`);
    lines.push('');
  }

  if (confirmation.hotelName) {
    lines.push('**Property:**');
    lines.push(`   ${confirmation.hotelName}`);
    lines.push('');
  }

  lines.push('Check your email for confirmation');

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
  selectPaymentMethod
};

// CLI mode for testing
if (require.main === module) {
  console.log('Payment Handoff Module');
  console.log('\nUsage:');
  console.log('  const { navigateToPayment, handoffToUser } = require("./payment-handoff.js");');
  console.log('  const paymentInfo = await navigateToPayment(page);');
  console.log('  await handoffToUser(paymentInfo);');
}
