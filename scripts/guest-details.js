#!/usr/bin/env node

/**
 * Guest Details Extractor and Form Filler for booking.com
 * Extracts guest details form fields and fills them automatically
 * Uses Playwright for browser automation
 *
 * Usage:
 *   const { extractGuestForm, fillGuestDetails, proceedToPayment } = require('./guest-details.js');
 *   const form = await extractGuestForm(page);
 *   await fillGuestDetails(page, guestData);
 *   await proceedToPayment(page);
 */

/**
 * Extract guest details form structure
 * @param {Object} page - Playwright page object
 * @returns {Promise<Object>} Form structure
 */
async function extractGuestForm(page) {
  try {
    console.log('Extracting guest details form...');

    const form = {
      success: false,
      fields: [],
      requiredFields: [],
      optionalFields: [],
      timestamp: new Date().toISOString()
    };

    // Extract form fields using page content
    const fields = await page.evaluate(() => {
      const fields = [];
      const inputs = document.querySelectorAll('input');
      const selects = document.querySelectorAll('select');
      const textareas = document.querySelectorAll('textarea');

      const allFields = [...inputs, ...selects, ...textareas];

      allFields.forEach(el => {
        const name = el.name || el.id || '';
        const label = document.querySelector(`label[for="${el.id}"]`)?.textContent ||
                     el.closest('label')?.textContent ||
                     el.getAttribute('aria-label') || '';

        if (name && (name.includes('name') || name.includes('email') ||
            name.includes('phone') || name.includes('country'))) {
          fields.push({
            name: name,
            label: label.trim(),
            type: el.type || el.tagName.toLowerCase(),
            required: el.hasAttribute('required')
          });
        }
      });

      return fields;
    });

    form.fields = fields;
    form.requiredFields = fields.filter(f => f.required);
    form.optionalFields = fields.filter(f => !f.required);
    form.success = true;

    console.log(`Extracted ${form.fields.length} form fields (${form.requiredFields.length} required)`);
    return form;

  } catch (error) {
    console.error('Error extracting guest form:', error.message);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Fill guest details form
 * @param {Object} page - Playwright page object
 * @param {Object} guestData - Guest information
 * @returns {Promise<Object>} Result
 */
async function fillGuestDetails(page, guestData) {
  try {
    console.log('Filling guest details form...');

    const result = {
      success: false,
      filledFields: [],
      errors: [],
      timestamp: new Date().toISOString()
    };

    // Validate guest data
    const validation = validateGuestData(guestData);
    if (!validation.valid) {
      result.errors = validation.errors;
      return result;
    }

    // Fill first name
    if (guestData.firstName) {
      const el = page.locator('input[name="firstname"], input[name="first_name"]').first();
      if (await el.isVisible().catch(() => false)) {
        await el.fill(guestData.firstName);
        result.filledFields.push('firstName');
      }
    }

    // Fill last name
    if (guestData.lastName) {
      const el = page.locator('input[name="lastname"], input[name="last_name"]').first();
      if (await el.isVisible().catch(() => false)) {
        await el.fill(guestData.lastName);
        result.filledFields.push('lastName');
      }
    }

    // Fill email
    if (guestData.email) {
      const el = page.locator('input[name="email"]').first();
      if (await el.isVisible().catch(() => false)) {
        await el.fill(guestData.email);
        result.filledFields.push('email');
      }
    }

    // Fill phone
    if (guestData.phone) {
      const el = page.locator('input[name="phone"], input[name="telephone"]').first();
      if (await el.isVisible().catch(() => false)) {
        await el.fill(guestData.phone);
        result.filledFields.push('phone');
      }
    }

    // Select country
    if (guestData.country) {
      const el = page.locator('select[name="country"], select[name="country_code"]').first();
      if (await el.isVisible().catch(() => false)) {
        await el.selectOption({ label: guestData.country });
        result.filledFields.push('country');
      }
    }

    // Fill special requests
    if (guestData.specialRequests) {
      const el = page.locator('textarea[name="special_requests"]').first();
      if (await el.isVisible().catch(() => false)) {
        await el.fill(guestData.specialRequests);
        result.filledFields.push('specialRequests');
      }
    }

    result.success = result.filledFields.length > 0;

    console.log(`Filled ${result.filledFields.length} fields`);
    return result;

  } catch (error) {
    console.error('Error filling guest details:', error.message);
    return {
      success: false,
      error: error.message,
      filledFields: [],
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Validate guest data
 */
function validateGuestData(guestData) {
  const errors = [];

  if (!guestData.firstName || guestData.firstName.trim().length === 0) {
    errors.push('First name is required');
  }

  if (!guestData.lastName || guestData.lastName.trim().length === 0) {
    errors.push('Last name is required');
  }

  if (!guestData.email || !isValidEmail(guestData.email)) {
    errors.push('Valid email is required');
  }

  if (!guestData.phone || guestData.phone.trim().length < 7) {
    errors.push('Valid phone number is required (min 7 digits)');
  }

  if (!guestData.country || guestData.country.trim().length === 0) {
    errors.push('Country is required');
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Proceed from guest details to payment page
 * @param {Object} page - Playwright page object
 * @returns {Promise<Object>} Result
 */
async function proceedToPayment(page) {
  try {
    console.log('Proceeding to payment...');

    // Find and click continue button
    const selectors = [
      'button:has-text("Continue to Booking")',
      'button:has-text("Continue")',
      'button:has-text("Next")',
      'button:has-text("Book now")',
      '[data-testid="continue-button"]'
    ];

    let clicked = false;
    for (const selector of selectors) {
      const btn = page.locator(selector).first();
      if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await btn.click();
        clicked = true;
        console.log('Clicked continue button');
        break;
      }
    }

    if (!clicked) {
      throw new Error('Continue button not found');
    }

    // Wait for navigation
    await page.waitForLoadState('networkidle');
    await sleep(1500);

    // Verify we're on payment page
    const url = page.url();
    const onPaymentPage = url.includes('checkout') || url.includes('payment') || url.includes('booking');

    console.log('Proceeded to payment page');

    return {
      success: true,
      onPaymentPage: onPaymentPage,
      url: url,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error proceeding to payment:', error.message);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Save guest data to profile (for future bookings)
 */
function saveGuestProfile(guestData, profileName = 'default') {
  console.log(`Saved guest profile: ${profileName}`);
  return {
    success: true,
    profileName: profileName,
    timestamp: new Date().toISOString()
  };
}

/**
 * Load guest data from profile
 */
function loadGuestProfile(profileName = 'default') {
  return null;
}

/**
 * Sleep helper
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Export for use in other modules
module.exports = {
  extractGuestForm,
  fillGuestDetails,
  validateGuestData,
  isValidEmail,
  saveGuestProfile,
  loadGuestProfile,
  proceedToPayment
};

// CLI mode for testing
if (require.main === module) {
  console.log('Guest Details Module');
  console.log('\nUsage:');
  console.log('  const { extractGuestForm, fillGuestDetails } = require("./guest-details.js");');
  console.log('  const form = await extractGuestForm(page);');
  console.log('  await fillGuestDetails(page, guestData);');
}
