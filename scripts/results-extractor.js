#!/usr/bin/env node

/**
 * Results Extractor for booking.com
 * Extracts hotel search results from booking.com pages
 * 
 * Usage:
 *   const { extractResults, extractHotelDetails } = require('./results-extractor.js');
 *   const results = await extractResults(browser);
 */

/**
 * Extract all hotel results from search results page
 * @param {Object} browser - Browser automation interface
 * @param {Object} options - Extraction options
 * @returns {Promise<Array>} Array of hotel result objects
 */
async function extractResults(browser, options = {}) {
  try {
    console.log('🔍 Extracting search results...');
    
    const maxResults = options.maxResults || 10;
    const results = [];
    
    // Get page snapshot
    const snapshot = await browser.snapshot({
      profile: 'chrome',
      refs: 'aria'
    });
    
    if (!snapshot) {
      throw new Error('Failed to get page snapshot');
    }
    
    // Parse results from snapshot
    const hotelCards = parseHotelCardsFromSnapshot(snapshot);
    
    // Extract details for each hotel (up to maxResults)
    for (let i = 0; i < Math.min(hotelCards.length, maxResults); i++) {
      try {
        const hotel = await extractHotelDetails(browser, hotelCards[i], i);
        if (hotel) {
          results.push(hotel);
        }
      } catch (error) {
        console.warn(`⚠️  Failed to extract hotel ${i + 1}: ${error.message}`);
      }
    }
    
    console.log(`✅ Extracted ${results.length} hotels`);
    return results;
    
  } catch (error) {
    console.error('❌ Error extracting results:', error.message);
    throw error;
  }
}

/**
 * Parse hotel cards from snapshot text
 */
function parseHotelCardsFromSnapshot(snapshot) {
  // This is a simplified parser
  // In production, would use proper DOM parsing
  const cards = [];
  
  // Look for hotel name patterns
  const namePattern = /(\d+\.\s+)?([A-Z][a-zA-Z\s&]+(?:Hotel|Inn|Resort|Suites|Apartments|Lodge|Guesthouse|Hostel))/g;
  let match;
  
  while ((match = namePattern.exec(snapshot)) !== null) {
    cards.push({
      nameMatch: match[2],
      index: cards.length
    });
  }
  
  return cards;
}

/**
 * Extract detailed information for a single hotel
 */
async function extractHotelDetails(browser, cardData, index) {
  const hotel = {
    index: index + 1,
    name: null,
    rating: null,
    reviewCount: null,
    price: null,
    pricePerNight: null,
    currency: 'USD',
    location: null,
    distance: null,
    amenities: [],
    imageUrl: null,
    bookingUrl: null,
    genius: false,
    freeCancellation: false,
    breakfastIncluded: false
  };
  
  try {
    // Extract hotel name
    hotel.name = cardData.nameMatch || `Hotel ${index + 1}`;
    
    // Extract rating (e.g., "9.2", "8.5")
    const ratingMatch = cardData.nameMatch?.match(/(\d\.\d)/);
    if (ratingMatch) {
      hotel.rating = parseFloat(ratingMatch[1]);
    }
    
    // Extract price
    const priceMatch = cardData.nameMatch?.match(/\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/);
    if (priceMatch) {
      hotel.price = parseFloat(priceMatch[1].replace(/,/g, ''));
      hotel.pricePerNight = hotel.price;
    }
    
    // Generate booking URL (simplified)
    hotel.bookingUrl = `https://www.booking.com/hotel/search.html?index=${index}`;
    
    return hotel;
    
  } catch (error) {
    console.warn(`⚠️  Error extracting hotel details: ${error.message}`);
    return null;
  }
}

/**
 * Extract hotel name from result card
 */
function extractHotelName(cardElement) {
  // Implementation would use browser DOM access
  // For now, return placeholder
  return 'Hotel Name';
}

/**
 * Extract price information from result card
 */
function extractPrice(cardElement) {
  // Implementation would use browser DOM access
  // For now, return placeholder
  return {
    total: null,
    perNight: null,
    currency: 'USD',
    taxes: null,
    fees: null
  };
}

/**
 * Extract rating and review count from result card
 */
function extractRating(cardElement) {
  // Implementation would use browser DOM access
  // For now, return placeholder
  return {
    score: null,
    outOf: 10,
    reviewCount: null,
    category: null // e.g., "Excellent", "Very Good"
  };
}

/**
 * Extract location information from result card
 */
function extractLocation(cardElement) {
  // Implementation would use browser DOM access
  // For now, return placeholder
  return {
    address: null,
    city: null,
    distanceFromCenter: null,
    coordinates: null
  };
}

/**
 * Extract amenities from result card
 */
function extractAmenities(cardElement) {
  // Implementation would use browser DOM access
  // For now, return placeholder
  return [
    // 'Free WiFi',
    // 'Parking',
    // 'Pool',
    // 'Breakfast included'
  ];
}

/**
 * Check if hotel has Genius discount
 */
function isGenius(cardElement) {
  // Implementation would check for Genius badge
  return false;
}

/**
 * Check if hotel offers free cancellation
 */
function hasFreeCancellation(cardElement) {
  // Implementation would check for free cancellation badge
  return false;
}

/**
 * Check if breakfast is included
 */
function hasBreakfastIncluded(cardElement) {
  // Implementation would check for breakfast included badge
  return false;
}

/**
 * Generate booking.com link for a hotel
 */
function generateBookingLink(hotelId, checkIn, checkOut, adults = 2, children = 0, rooms = 1) {
  const baseUrl = 'https://www.booking.com/hotel';
  const params = new URLSearchParams({
    checkin: checkIn,
    checkout: checkOut,
    group_adults: adults.toString(),
    group_children: children.toString(),
    no_rooms: rooms.toString()
  });
  
  return `${baseUrl}/${hotelId}?${params.toString()}`;
}

/**
 * Sort results by specified criteria
 */
function sortResults(results, criteria = 'bestValue') {
  const sorted = [...results];
  
  switch (criteria) {
    case 'price':
      sorted.sort((a, b) => (a.pricePerNight || 0) - (b.pricePerNight || 0));
      break;
    case 'rating':
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case 'bestValue':
    default:
      // Best value = rating / price ratio
      sorted.sort((a, b) => {
        const valueA = (a.rating || 5) / (a.pricePerNight || 100);
        const valueB = (b.rating || 5) / (b.pricePerNight || 100);
        return valueB - valueA;
      });
      break;
  }
  
  return sorted;
}

/**
 * Filter results by criteria
 */
function filterResults(results, filters = {}) {
  let filtered = [...results];
  
  if (filters.maxPrice) {
    filtered = filtered.filter(h => (h.pricePerNight || Infinity) <= filters.maxPrice);
  }
  
  if (filters.minRating) {
    filtered = filtered.filter(h => (h.rating || 0) >= filters.minRating);
  }
  
  if (filters.geniusOnly) {
    filtered = filtered.filter(h => h.genius);
  }
  
  if (filters.freeCancellation) {
    filtered = filtered.filter(h => h.freeCancellation);
  }
  
  if (filters.breakfastIncluded) {
    filtered = filtered.filter(h => h.breakfastIncluded);
  }
  
  return filtered;
}

/**
 * Format results for display
 */
function formatResults(results, options = {}) {
  const topN = options.top || 5;
  const sortBy = options.sortBy || 'bestValue';
  
  // Sort and limit results
  const sorted = sortResults(results, sortBy);
  const topResults = sorted.slice(0, topN);
  
  // Format each result
  const formatted = topResults.map((hotel, index) => {
    const lines = [
      `${index + 1}. ${hotel.name || 'Unknown Hotel'}`
    ];
    
    if (hotel.rating) {
      const category = getRatingCategory(hotel.rating);
      lines.push(`   ⭐ ${hotel.rating}/10 ${category}`);
    }
    
    if (hotel.pricePerNight) {
      lines.push(`   💰 $${hotel.pricePerNight}/night`);
    }
    
    if (hotel.location) {
      lines.push(`   📍 ${hotel.location}`);
    }
    
    if (hotel.amenities && hotel.amenities.length > 0) {
      lines.push(`   🏨 ${hotel.amenities.slice(0, 3).join(' • ')}`);
    }
    
    if (hotel.genius) {
      lines.push(`   🎯 Genius discount available`);
    }
    
    if (hotel.freeCancellation) {
      lines.push(`   ✅ Free cancellation`);
    }
    
    if (hotel.bookingUrl) {
      lines.push(`   🔗 ${hotel.bookingUrl}`);
    }
    
    return lines.join('\n');
  });
  
  return formatted.join('\n\n');
}

/**
 * Get rating category text
 */
function getRatingCategory(score) {
  if (score >= 9.0) return 'Exceptional';
  if (score >= 8.0) return 'Very Good';
  if (score >= 7.0) return 'Good';
  if (score >= 6.0) return 'Pleasant';
  return 'Okay';
}

/**
 * Find best value hotel
 */
function findBestValue(results) {
  if (!results || results.length === 0) {
    return null;
  }
  
  const sorted = sortResults(results, 'bestValue');
  return sorted[0];
}

/**
 * Find cheapest hotel
 */
function findCheapest(results) {
  if (!results || results.length === 0) {
    return null;
  }
  
  const sorted = sortResults(results, 'price');
  return sorted[0];
}

/**
 * Find highest rated hotel
 */
function findHighestRated(results) {
  if (!results || results.length === 0) {
    return null;
  }
  
  const sorted = sortResults(results, 'rating');
  return sorted[0];
}

// Export for use in other modules
module.exports = {
  extractResults,
  extractHotelDetails,
  extractHotelName,
  extractPrice,
  extractRating,
  extractLocation,
  extractAmenities,
  isGenius,
  hasFreeCancellation,
  hasBreakfastIncluded,
  generateBookingLink,
  sortResults,
  filterResults,
  formatResults,
  getRatingCategory,
  findBestValue,
  findCheapest,
  findHighestRated
};

// CLI mode for testing
if (require.main === module) {
  console.log('Results Extractor Module');
  console.log('This module requires browser automation to be configured.');
  console.log('\nUsage:');
  console.log('  const { extractResults, formatResults } = require("./results-extractor.js");');
  console.log('  const results = await extractResults(browser);');
  console.log('  console.log(formatResults(results, { top: 5 }));');
}
