#!/usr/bin/env node

/**
 * Guest Details Extractor and Form Filler for booking.com
 * Extracts guest details form fields and fills them automatically
 * 
 * Usage:
 *   const { extractGuestForm, fillGuestDetails } = require('./guest-details.js');
 *   const form = await extractGuestForm(browser);
 *   await fillGuestDetails(browser, guestData);
 */

/**
 * Guest data structure
 * @typedef {Object} GuestData
 * @property {string} firstName - Guest first name
 * @property {string} lastName - Guest last name
 * @property {string} email - Email address
 * @property {string} phone - Phone number with country code
 * @property {string} country - Country of residence
 * @property {string} specialRequests - Special requests (optional)
 */

/**
 * Extract guest details form structure
 * @param {Object} browser - Browser automation interface
 * @returns {Promise<Object>} Form structure
 */
async function extractGuestForm(browser) {
  try {
    console.log('📝 Extracting guest details form...');
    
    const form = {
      success: false,
      fields: [],
      requiredFields: [],
      optionalFields: [],
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
    
    // Verify we're on guest details page
    const isGuestPage = snapshot.includes('Guest details') || 
                       snapshot.includes('Your details') ||
                       snapshot.includes('First name') ||
                       snapshot.includes('Last name');
    
    if (!isGuestPage) {
      throw new Error('Not on guest details page');
    }
    
    // Extract form fields
    form.fields = extractFormFields(snapshot);
    form.requiredFields = form.fields.filter(f => f.required);
    form.optionalFields = form.fields.filter(f => !f.required);
    
    form.success = true;
    
    console.log(`✅ Extracted ${form.fields.length} form fields (${form.requiredFields.length} required)`);
    return form;
    
  } catch (error) {
    console.error('❌ Error extracting guest form:', error.message);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Extract form fields from snapshot
 */
function extractFormFields(snapshot) {
  const fields = [];
  
  // First name field
  if (snapshot.includes('First name') || snapshot.includes('Given name')) {
    fields.push({
      name: 'firstName',
      label: 'First name',
      required: true,
      type: 'text',
      ref: extractFieldRef(snapshot, 'First name')
    });
  }
  
  // Last name field
  if (snapshot.includes('Last name') || snapshot.includes('Family name')) {
    fields.push({
      name: 'lastName',
      label: 'Last name',
      required: true,
      type: 'text',
      ref: extractFieldRef(snapshot, 'Last name')
    });
  }
  
  // Email field
  if (snapshot.includes('Email') || snapshot.includes('Email address')) {
    fields.push({
      name: 'email',
      label: 'Email address',
      required: true,
      type: 'email',
      ref: extractFieldRef(snapshot, 'Email')
    });
  }
  
  // Phone field
  if (snapshot.includes('Phone') || snapshot.includes('Mobile')) {
    fields.push({
      name: 'phone',
      label: 'Phone number',
      required: true,
      type: 'tel',
      ref: extractFieldRef(snapshot, 'Phone')
    });
  }
  
  // Country field
  if (snapshot.includes('Country') || snapshot.includes('Country of residence')) {
    fields.push({
      name: 'country',
      label: 'Country of residence',
      required: true,
      type: 'select',
      ref: extractFieldRef(snapshot, 'Country')
    });
  }
  
  // Special requests
  if (snapshot.includes('Special requests') || snapshot.includes('Special requests')) {
    fields.push({
      name: 'specialRequests',
      label: 'Special requests',
      required: false,
      type: 'textarea',
      ref: extractFieldRef(snapshot, 'Special requests')
    });
  }
  
  return fields;
}

/**
 * Extract field reference from snapshot
 */
function extractFieldRef(snapshot, fieldName) {
  // Look for combobox or textbox with field name
  const patterns = [
    new RegExp(`combobox "${fieldName}" \\[ref=(e\\d+)\\]`, 'i'),
    new RegExp(`textbox "${fieldName}" \\[ref=(e\\d+)\\]`, 'i'),
    new RegExp(`"${fieldName}" \\[ref=(e\\d+)\\]`, 'i')
  ];
  
  for (const pattern of patterns) {
    const match = snapshot.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Fill guest details form
 * @param {Object} browser - Browser automation interface
 * @param {GuestData} guestData - Guest information
 * @returns {Promise<Object>} Result
 */
async function fillGuestDetails(browser, guestData) {
  try {
    console.log('📝 Filling guest details form...');
    
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
    
    // Get page snapshot to find field refs
    const snapshot = await browser.snapshot({
      profile: 'chrome',
      refs: 'aria'
    });
    
    if (!snapshot) {
      throw new Error('Failed to get page snapshot');
    }
    
    // Fill first name
    if (guestData.firstName) {
      const ref = extractFieldRef(snapshot, 'First name');
      if (ref) {
        await fillField(browser, ref, guestData.firstName);
        result.filledFields.push('firstName');
      }
    }
    
    // Fill last name
    if (guestData.lastName) {
      const ref = extractFieldRef(snapshot, 'Last name');
      if (ref) {
        await fillField(browser, ref, guestData.lastName);
        result.filledFields.push('lastName');
      }
    }
    
    // Fill email
    if (guestData.email) {
      const ref = extractFieldRef(snapshot, 'Email');
      if (ref) {
        await fillField(browser, ref, guestData.email);
        result.filledFields.push('email');
      }
    }
    
    // Fill phone
    if (guestData.phone) {
      const ref = extractFieldRef(snapshot, 'Phone');
      if (ref) {
        await fillField(browser, ref, guestData.phone);
        result.filledFields.push('phone');
      }
    }
    
    // Fill country
    if (guestData.country) {
      const ref = extractFieldRef(snapshot, 'Country');
      if (ref) {
        await selectCountry(browser, ref, guestData.country);
        result.filledFields.push('country');
      }
    }
    
    // Fill special requests
    if (guestData.specialRequests) {
      const ref = extractFieldRef(snapshot, 'Special requests');
      if (ref) {
        await fillField(browser, ref, guestData.specialRequests);
        result.filledFields.push('specialRequests');
      }
    }
    
    result.success = result.filledFields.length > 0;
    
    console.log(`✅ Filled ${result.filledFields.length} fields`);
    return result;
    
  } catch (error) {
    console.error('❌ Error filling guest details:', error.message);
    return {
      success: false,
      error: error.message,
      filledFields: [],
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Fill a form field
 */
async function fillField(browser, ref, value) {
  try {
    await browser.act({
      profile: 'chrome',
      request: {
        kind: 'type',
        ref: ref,
        text: value
      }
    });
    return true;
  } catch (error) {
    console.error(`Failed to fill field ${ref}:`, error.message);
    return false;
  }
}

/**
 * Select country from dropdown
 */
async function selectCountry(browser, ref, country) {
  try {
    // First click to open dropdown
    await browser.act({
      profile: 'chrome',
      request: {
        kind: 'click',
        ref: ref
      }
    });
    
    // Small delay for dropdown to open
    await sleep(500);
    
    // Type country name to filter
    await browser.act({
      profile: 'chrome',
      request: {
        kind: 'type',
        ref: ref,
        text: country
      }
    });
    
    // Press Enter to select
    await browser.act({
      profile: 'chrome',
      request: {
        kind: 'press',
        key: 'Enter'
      }
    });
    
    return true;
  } catch (error) {
    console.error(`Failed to select country ${ref}:`, error.message);
    return false;
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
 * Sleep helper
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Save guest data to profile (for future bookings)
 */
function saveGuestProfile(guestData, profileName = 'default') {
  // In a real implementation, this would save to a database or config file
  console.log(`💾 Saved guest profile: ${profileName}`);
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
  // In a real implementation, this would load from a database or config file
  // For now, return null to indicate no saved profile
  return null;
}

// Export for use in other modules
module.exports = {
  extractGuestForm,
  fillGuestDetails,
  validateGuestData,
  isValidEmail,
  saveGuestProfile,
  loadGuestProfile
};

// CLI mode for testing
if (require.main === module) {
  console.log('Guest Details Module');
  console.log('\nUsage:');
  console.log('  const { extractGuestForm, fillGuestDetails } = require("./guest-details.js");');
  console.log('  const form = await extractGuestForm(browser);');
  console.log('  await fillGuestDetails(browser, guestData);');
  console.log('\nGuest Data Structure:');
  console.log('  {');
  console.log('    firstName: "John",');
  console.log('    lastName: "Doe",');
  console.log('    email: "john@example.com",');
  console.log('    phone: "+1-555-0123",');
  console.log('    country: "United States",');
  console.log('    specialRequests: "Late check-in"');
  console.log('  }');
}
