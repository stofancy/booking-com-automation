#!/usr/bin/env node

/**
 * Property Details Extractor for booking.com
 * Extracts comprehensive hotel information from property details page
 * 
 * Usage:
 *   const { extractPropertyDetails } = require('./property-details.js');
 *   const details = await extractPropertyDetails(browser);
 */

/**
 * Extract all property details from current page
 * @param {Object} browser - Browser automation interface
 * @returns {Promise<Object>} Property details object
 */
async function extractPropertyDetails(browser) {
  try {
    console.log('🏨 Extracting property details...');
    
    const details = {
      success: false,
      name: null,
      starRating: null,
      guestScore: null,
      reviewCount: null,
      reviewCategory: null,
      address: null,
      location: null,
      distanceFromCenter: null,
      amenities: [],
      photos: [],
      description: null,
      checkInTime: null,
      checkOutTime: null,
      cancellationPolicy: null,
      rooms: [],
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
    
    // Extract basic info
    details.name = extractHotelName(snapshot);
    details.starRating = extractStarRating(snapshot);
    details.guestScore = extractGuestScore(snapshot);
    details.reviewCount = extractReviewCount(snapshot);
    details.reviewCategory = extractReviewCategory(snapshot);
    details.address = extractAddress(snapshot);
    details.location = extractLocation(snapshot);
    details.distanceFromCenter = extractDistanceFromCenter(snapshot);
    details.amenities = extractAmenities(snapshot);
    details.description = extractDescription(snapshot);
    details.checkInTime = extractCheckInTime(snapshot);
    details.checkOutTime = extractCheckOutTime(snapshot);
    details.cancellationPolicy = extractCancellationPolicy(snapshot);
    
    details.success = true;
    
    console.log(`✅ Extracted details for: ${details.name || 'Unknown Hotel'}`);
    return details;
    
  } catch (error) {
    console.error('❌ Error extracting property details:', error.message);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Extract hotel name from snapshot
 * Verified on live booking.com (ref=e235, e247)
 */
function extractHotelName(snapshot) {
  // Pattern 1: Look for heading with hotel name (verified pattern)
  const headingMatch = snapshot.match(/heading "([^"]+)" \[level=2\]/i);
  if (headingMatch && headingMatch[1]) {
    return headingMatch[1].trim();
  }
  
  // Pattern 2: Look for H1 breadcrumb
  const h1Match = snapshot.match(/\[level=1\][^]]*?:\s*([^\n]+)/i);
  if (h1Match && h1Match[1]) {
    const name = h1Match[1].split('(')[0].trim(); // Remove "(Hotel) (France)" suffix
    return name;
  }
  
  // Pattern 3: Look for hotel name pattern
  const nameMatch = snapshot.match(/(?:Hotel|Inn|Resort|Suites|Apartments|Hôtel)\s+[A-Z][a-zA-ZÀ-ÿ\s&]+/i);
  if (nameMatch) {
    return nameMatch[0].trim();
  }
  
  return null;
}

/**
 * Extract star rating from snapshot
 * Verified on live booking.com (ref=e199, e211)
 */
function extractStarRating(snapshot) {
  // Pattern 1: Look for "X out of 5 stars" button (verified pattern)
  const starButtonMatch = snapshot.match(/button "(\d) out of 5 stars"/i);
  if (starButtonMatch && starButtonMatch[1]) {
    return parseInt(starButtonMatch[1]);
  }
  
  // Pattern 2: Look for "X-star hotel"
  const starMatch = snapshot.match(/(\d)-star/i);
  if (starMatch && starMatch[1]) {
    return parseInt(starMatch[1]);
  }
  
  // Pattern 3: Count star emojis
  const starEmojis = (snapshot.match(/⭐/g) || []).length;
  if (starEmojis > 0) {
    return starEmojis;
  }
  
  return null;
}

/**
 * Extract guest score from snapshot
 * Verified on live booking.com (ref=e315, e327)
 */
function extractGuestScore(snapshot) {
  // Pattern 1: Look for quoted score (verified pattern: generic "9.2")
  const scoreMatch = snapshot.match(/generic "(\d\.\d)"/);
  if (scoreMatch && scoreMatch[1]) {
    return parseFloat(scoreMatch[1]);
  }
  
  // Pattern 2: Look for score pattern (e.g., "9.2" or "9,2")
  const altScoreMatch = snapshot.match(/["']([89]\.\d|10\.0)["']/);
  if (altScoreMatch && altScoreMatch[1]) {
    return parseFloat(altScoreMatch[1].replace(',', '.'));
  }
  
  return null;
}

/**
 * Extract review count from snapshot
 * Verified on live booking.com (ref=e319, e331)
 */
function extractReviewCount(snapshot) {
  // Pattern 1: Look for "· 1,493 reviews" pattern (verified)
  const reviewMatch = snapshot.match(/·\s*([\d,]+)\s*reviews/i);
  if (reviewMatch && reviewMatch[1]) {
    return parseInt(reviewMatch[1].replace(/,/g, ''));
  }
  
  // Pattern 2: Look for "1,234 reviews" pattern
  const altReviewMatch = snapshot.match(/(\d{1,3}(?:,\d{3})*)\s*reviews/i);
  if (altReviewMatch && altReviewMatch[1]) {
    return parseInt(altReviewMatch[1].replace(/,/g, ''));
  }
  
  return null;
}

/**
 * Extract review category from snapshot
 * Verified on live booking.com (ref=e318, e330)
 */
function extractReviewCategory(snapshot) {
  // Look for category in order of quality (first match wins)
  const categories = [
    'Exceptional',  // 9.0+
    'Wonderful',    // 9.0+
    'Very Good',    // 8.0+
    'Good',         // 7.0+
    'Pleasant',     // 6.0+
    'Okay',         // 5.0+
    'Poor'          // <5.0
  ];
  
  for (const category of categories) {
    if (snapshot.includes(category)) {
      return category;
    }
  }
  
  return null;
}

/**
 * Extract address from snapshot
 */
function extractAddress(snapshot) {
  // Look for address pattern
  const addressMatch = snapshot.match(/(?:Street|Avenue|Road|Boulevard|Lane)[^,\n]+,[^,\n]+/i);
  if (addressMatch) {
    return addressMatch[0].trim();
  }
  
  return null;
}

/**
 * Extract location (city/area) from snapshot
 */
function extractLocation(snapshot) {
  // Look for location pattern (e.g., "9th arr., Paris")
  const locationMatch = snapshot.match(/(\d+(?:st|nd|rd|th)?\s*(?:arr\.?|district)[^,\n]+,\s*[A-Z][a-z]+)/i);
  if (locationMatch && locationMatch[0]) {
    return locationMatch[0].trim();
  }
  
  // Look for city name
  const cityMatch = snapshot.match(/(?:Paris|London|New York|Tokyo|Barcelona)[^,\n]*/i);
  if (cityMatch) {
    return cityMatch[0].trim();
  }
  
  return null;
}

/**
 * Extract distance from center from snapshot
 */
function extractDistanceFromCenter(snapshot) {
  // Look for distance pattern (e.g., "0.8km from center")
  const distanceMatch = snapshot.match(/(\d+\.?\d*)\s*(?:km|miles)\s*(?:from\s*)?center/i);
  if (distanceMatch && distanceMatch[0]) {
    return distanceMatch[0].trim();
  }
  
  return null;
}

/**
 * Extract amenities list from snapshot
 */
function extractAmenities(snapshot) {
  const amenities = [];
  
  // Common amenities to look for
  const amenityList = [
    'Free WiFi', 'WiFi', 'Internet',
    'Breakfast', 'Breakfast included',
    'Air conditioning', 'Air conditioning',
    'Parking', 'Free parking',
    'Pool', 'Swimming pool',
    'Gym', 'Fitness center',
    'Spa', 'Wellness center',
    'Restaurant', 'Bar',
    'Room service', '24-hour front desk',
    'Pet friendly', 'Pets allowed',
    'Airport shuttle', 'Non-smoking rooms'
  ];
  
  for (const amenity of amenityList) {
    if (snapshot.includes(amenity)) {
      amenities.push(amenity);
    }
  }
  
  return amenities;
}

/**
 * Extract description from snapshot
 */
function extractDescription(snapshot) {
  // Look for description section
  const descMatch = snapshot.match(/(?:About this property|Description)[\s\S]{0,500}/i);
  if (descMatch) {
    return descMatch[0].substring(0, 500).trim();
  }
  
  return null;
}

/**
 * Extract check-in time from snapshot
 */
function extractCheckInTime(snapshot) {
  // Look for check-in time pattern
  const checkInMatch = snapshot.match(/Check-in:\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
  if (checkInMatch && checkInMatch[1]) {
    return checkInMatch[1].trim();
  }
  
  // Look for "from" time pattern
  const fromMatch = snapshot.match(/from\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
  if (fromMatch && fromMatch[1]) {
    return 'From ' + fromMatch[1].trim();
  }
  
  return null;
}

/**
 * Extract check-out time from snapshot
 */
function extractCheckOutTime(snapshot) {
  // Look for check-out time pattern
  const checkOutMatch = snapshot.match(/Check-out:\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
  if (checkOutMatch && checkOutMatch[1]) {
    return checkOutMatch[1].trim();
  }
  
  // Look for "until" time pattern
  const untilMatch = snapshot.match(/until\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
  if (untilMatch && untilMatch[1]) {
    return 'Until ' + untilMatch[1].trim();
  }
  
  return null;
}

/**
 * Extract cancellation policy from snapshot
 */
function extractCancellationPolicy(snapshot) {
  // Look for cancellation policy keywords
  if (snapshot.includes('Free cancellation')) {
    if (snapshot.includes('until')) {
      const untilMatch = snapshot.match(/Free cancellation until ([^\n]+)/i);
      if (untilMatch && untilMatch[1]) {
        return 'Free cancellation until ' + untilMatch[1].trim();
      }
    }
    return 'Free cancellation';
  }
  
  if (snapshot.includes('Non-refundable')) {
    return 'Non-refundable';
  }
  
  if (snapshot.includes('Free cancellation before')) {
    const beforeMatch = snapshot.match(/Free cancellation before ([^\n]+)/i);
    if (beforeMatch && beforeMatch[1]) {
      return 'Free cancellation before ' + beforeMatch[1].trim();
    }
  }
  
  return null;
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
    const category = details.reviewCategory || '';
    const reviews = details.reviewCount ? `(${details.reviewCount.toLocaleString()} reviews)` : '';
    lines.push(`⭐ ${details.guestScore}/10 ${category} ${reviews}`);
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
  extractHotelName,
  extractStarRating,
  extractGuestScore,
  extractReviewCount,
  extractReviewCategory,
  extractAddress,
  extractLocation,
  extractDistanceFromCenter,
  extractAmenities,
  extractDescription,
  extractCheckInTime,
  extractCheckOutTime,
  extractCancellationPolicy,
  formatPropertyDetails
};

// CLI mode for testing
if (require.main === module) {
  console.log('Property Details Extractor Module');
  console.log('This module requires browser automation to be configured.');
  console.log('\nUsage:');
  console.log('  const { extractPropertyDetails, formatPropertyDetails } = require("./property-details.js");');
  console.log('  const details = await extractPropertyDetails(browser);');
  console.log('  console.log(formatPropertyDetails(details));');
}
