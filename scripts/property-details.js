#!/usr/bin/env node

/**
 * Property Details Extractor for booking.com
 * Extracts comprehensive hotel information from property details page
 * Uses Playwright for browser automation
 *
 * Usage:
 *   const { extractPropertyDetails } = require('./property-details.js');
 *   const details = await extractPropertyDetails(page);
 */

/**
 * Extract all property details from current page
 * @param {Object} page - Playwright page object
 * @returns {Promise<Object>} Property details object
 */
async function extractPropertyDetails(page) {
  try {
    console.log('Extracting property details...');

    // Extract data using Playwright's evaluate
    const data = await page.evaluate(() => {
      const details = {
        name: null,
        starRating: null,
        guestScore: null,
        reviewCount: null,
        address: null,
        location: null,
        distanceFromCenter: null,
        amenities: [],
        description: null,
        checkInTime: null,
        checkOutTime: null,
        cancellationPolicy: null
      };

      // Get hotel name - look in h1 or heading
      const h1 = document.querySelector('h1') || document.querySelector('[data-testid="hotel-title"]');
      if (h1) {
        details.name = h1.textContent.trim();
      }

      // Get star rating
      const stars = document.querySelectorAll('[data-testid="stars"] span, .star-rating span');
      details.starRating = stars.length || null;

      // Get guest score
      const scoreEl = document.querySelector('[data-testid="review-score"]') ||
                       document.querySelector('.b-review-score-cc__score');
      if (scoreEl) {
        const scoreText = scoreEl.textContent.trim();
        const scoreMatch = scoreText.match(/(\d+\.?\d*)/);
        if (scoreMatch) {
          details.guestScore = parseFloat(scoreMatch[1]);
        }
      }

      // Get review count
      const reviewsEl = document.querySelector('[data-testid="review-score"] .b-review-score-cc__amount');
      if (reviewsEl) {
        const reviewText = reviewsEl.textContent.replace(/[^\d]/g, '');
        details.reviewCount = parseInt(reviewText) || null;
      }

      // Get address
      const addressEl = document.querySelector('[data-testid="hotel-address"]') ||
                        document.querySelector('.bui-link, [data-testid="location"]');
      if (addressEl) {
        details.address = addressEl.textContent.trim();
      }

      // Get location (area/district)
      const locationEl = document.querySelector('[data-testid="location"]');
      if (locationEl) {
        details.location = locationEl.textContent.trim();
      }

      // Get distance from center
      const distanceEl = document.querySelector('[data-testid="distance-from-center"]');
      if (distanceEl) {
        details.distanceFromCenter = distanceEl.textContent.trim();
      }

      // Get amenities - look in the amenities section
      const amenityElements = document.querySelectorAll('[data-testid="amenities"] li, .bui-list__item');
      const amenitySet = new Set();
      amenityElements.forEach(el => {
        const text = el.textContent.trim();
        if (text && text.length < 50) {
          amenitySet.add(text);
        }
      });
      details.amenities = Array.from(amenitySet).slice(0, 15);

      // Get description
      const descEl = document.querySelector('[data-testid="property-description"]') ||
                     document.querySelector('.property_description');
      if (descEl) {
        details.description = descEl.textContent.trim().substring(0, 500);
      }

      // Get check-in/check-out times
      const checkinEl = document.querySelector('[data-testid="check-in-time"]');
      if (checkinEl) {
        details.checkInTime = checkinEl.textContent.trim();
      }

      const checkoutEl = document.querySelector('[data-testid="check-out-time"]');
      if (checkoutEl) {
        details.checkOutTime = checkoutEl.textContent.trim();
      }

      // Get cancellation policy
      const bodyText = document.body.innerText;
      if (bodyText.includes('Free cancellation')) {
        if (bodyText.includes('until')) {
          const match = bodyText.match(/Free cancellation until ([^\n]+)/);
          details.cancellationPolicy = match ? 'Free cancellation until ' + match[1].trim() : 'Free cancellation';
        } else {
          details.cancellationPolicy = 'Free cancellation';
        }
      } else if (bodyText.includes('Non-refundable')) {
        details.cancellationPolicy = 'Non-refundable';
      }

      return details;
    });

    const result = {
      success: true,
      ...data,
      rooms: [],
      timestamp: new Date().toISOString()
    };

    console.log(`Extracted details for: ${result.name || 'Unknown Hotel'}`);
    return result;

  } catch (error) {
    console.error('Error extracting property details:', error.message);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Format property details for display
 */
function formatPropertyDetails(details) {
  const lines = [];

  // Header
  let header = details.name || 'Unknown Hotel';
  if (details.starRating) {
    header = '⭐'.repeat(details.starRating) + ' ' + header;
  }
  lines.push(header);
  lines.push('');

  // Rating
  if (details.guestScore) {
    const reviews = details.reviewCount ? `(${details.reviewCount.toLocaleString()} reviews)` : '';
    lines.push(`⭐ ${details.guestScore}/10 ${reviews}`);
  }

  // Location
  if (details.location) {
    lines.push(`📍 ${details.location}`);
  }
  if (details.distanceFromCenter) {
    lines.push(`🚶 ${details.distanceFromCenter}`);
  }
  if (details.address) {
    lines.push(`🏠 ${details.address}`);
  }

  lines.push('');

  // Amenities
  if (details.amenities && details.amenities.length > 0) {
    lines.push('🏨 Amenities:');
    details.amenities.slice(0, 10).forEach(a => {
      lines.push(`  • ${a}`);
    });
    if (details.amenities.length > 10) {
      lines.push(`  ... and ${details.amenities.length - 10} more`);
    }
    lines.push('');
  }

  // Check-in/Check-out
  if (details.checkInTime || details.checkOutTime) {
    lines.push('🕐 Check-in/Check-out:');
    if (details.checkInTime) lines.push(`  • Check-in: ${details.checkInTime}`);
    if (details.checkOutTime) lines.push(`  • Check-out: ${details.checkOutTime}`);
    lines.push('');
  }

  // Cancellation
  if (details.cancellationPolicy) {
    lines.push(`📋 Cancellation: ${details.cancellationPolicy}`);
    lines.push('');
  }

  return lines.join('\n');
}

// Export for use in other modules
module.exports = {
  extractPropertyDetails,
  formatPropertyDetails
};

// CLI mode for testing
if (require.main === module) {
  console.log('Property Details Extractor Module');
  console.log('This module requires Playwright to be configured.');
  console.log('\nUsage:');
  console.log('  const { extractPropertyDetails } = require("./property-details.js");');
  console.log('  const details = await extractPropertyDetails(page);');
}
