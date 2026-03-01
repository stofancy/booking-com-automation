#!/usr/bin/env node

/**
 * Room Options Extractor for booking.com
 * Extracts available rooms and rate options from property details page
 * 
 * Usage:
 *   const { extractRoomOptions } = require('./room-extractor.js');
 *   const rooms = await extractRoomOptions(browser);
 */

/**
 * Extract all available room options from current page
 * @param {Object} browser - Browser automation interface
 * @returns {Promise<Array>} Array of room option objects
 */
async function extractRoomOptions(browser) {
  try {
    console.log('🛏️  Extracting room options...');
    
    // Get page snapshot
    const snapshot = await browser.snapshot({
      profile: 'chrome',
      refs: 'aria'
    });
    
    if (!snapshot) {
      throw new Error('Failed to get page snapshot');
    }
    
    // Parse rooms from snapshot
    const rooms = parseRoomsFromSnapshot(snapshot);
    
    console.log(`✅ Extracted ${rooms.length} room options`);
    return rooms;
    
  } catch (error) {
    console.error('❌ Error extracting room options:', error.message);
    return [];
  }
}

/**
 * Parse room information from snapshot
 */
function parseRoomsFromSnapshot(snapshot) {
  const rooms = [];
  
  // Look for room section markers
  const roomSections = snapshot.split(/(?:Room|Suite|Studio|Apartment)/i);
  
  for (let i = 1; i < roomSections.length && rooms.length < 10; i++) {
    const section = roomSections[i];
    const room = extractRoomFromSection(section, i);
    if (room) {
      rooms.push(room);
    }
  }
  
  return rooms;
}

/**
 * Extract room details from a section
 */
function extractRoomFromSection(section, index) {
  const room = {
    index: index,
    name: null,
    type: null,
    size: null,
    beds: null,
    maxOccupancy: null,
    amenities: [],
    rates: [],
    images: [],
    available: true
  };
  
  // Extract room name
  const nameMatch = section.match(/([A-Z][a-zA-Z\s&]+(?:Room|Suite|Studio|Apartment))/i);
  if (nameMatch) {
    room.name = nameMatch[1].trim();
  }
  
  // Extract room size
  const sizeMatch = section.match(/(\d+(?:\.\d+)?)\s*(?:m²|sqm|sq\.?ft\.?|square\s*(?:meters?|feet))/i);
  if (sizeMatch) {
    room.size = {
      value: parseFloat(sizeMatch[1]),
      unit: sizeMatch[0].includes('m²') || sizeMatch[0].includes('sqm') ? 'm²' : 'sqft'
    };
  }
  
  // Extract bed information
  const bedMatch = section.match(/(\d+)\s*(?:bed|beds)[^,\n]*(?:,?\s*(\d+)\s*(?:sofa\s*bed|single|double|king|queen))?/i);
  if (bedMatch) {
    room.beds = {
      count: parseInt(bedMatch[1]),
      type: bedMatch[2] || 'standard'
    };
  }
  
  // Extract max occupancy
  const occupancyMatch = section.match(/(?:sleeps|max\.?\s*occupancy)[:\s]*(\d+)\s*(?:adults?|people|persons|guests)?/i);
  if (occupancyMatch) {
    room.maxOccupancy = parseInt(occupancyMatch[1]);
  }
  
  // Extract amenities
  room.amenities = extractRoomAmenities(section);
  
  // Extract rates
  room.rates = extractRoomRates(section);
  
  // Check availability
  room.available = !section.includes('sold out') && !section.includes('not available');
  
  // Only return if we have meaningful data
  if (room.name || room.rates.length > 0) {
    return room;
  }
  
  return null;
}

/**
 * Extract room amenities from section
 */
function extractRoomAmenities(section) {
  const amenities = [];
  
  const amenityKeywords = {
    'Air conditioning': ['air conditioning', 'air-con', 'a/c'],
    'Private bathroom': ['private bathroom', 'en-suite', 'ensuite'],
    'Free WiFi': ['free wifi', 'wifi', 'internet'],
    'Flat-screen TV': ['flat-screen tv', 'tv', 'television'],
    'Minibar': ['minibar', 'mini-bar'],
    'Safe': ['safe', 'safety box'],
    'Balcony': ['balcony', 'terrace'],
    'City view': ['city view', 'view'],
    'Soundproof': ['soundproof', 'sound-proof'],
    'Desk': ['desk', 'work desk'],
    'Seating area': ['seating area', 'lounge'],
    'Coffee machine': ['coffee machine', 'coffee maker', 'espresso'],
    'Bathrobe': ['bathrobe', 'robe'],
    'Slippers': ['slippers'],
    'Hairdryer': ['hairdryer', 'hair dryer'],
    'Free toiletries': ['free toiletries', 'toiletries']
  };
  
  const sectionLower = section.toLowerCase();
  
  for (const [amenity, keywords] of Object.entries(amenityKeywords)) {
    if (keywords.some(keyword => sectionLower.includes(keyword))) {
      amenities.push(amenity);
    }
  }
  
  return amenities;
}

/**
 * Extract rate options from section
 */
function extractRoomRates(section) {
  const rates = [];
  
  // Look for price patterns
  const priceMatches = [...section.matchAll(/\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/g)];
  
  if (priceMatches.length > 0) {
    // First price is usually per night
    const perNightMatch = priceMatches[0];
    const perNight = parseFloat(perNightMatch[1].replace(/,/g, ''));
    
    // Determine rate type
    let rateType = 'Standard';
    if (section.toLowerCase().includes('free cancellation')) {
      rateType = 'Flexible';
    } else if (section.toLowerCase().includes('non-refundable')) {
      rateType = 'Non-refundable';
    } else if (section.toLowerCase().includes('breakfast')) {
      rateType = 'Breakfast included';
    }
    
    // Calculate total (assume 3 nights for now)
    const total = perNight * 3;
    
    rates.push({
      type: rateType,
      perNight: perNight,
      total: total,
      currency: 'USD',
      refundable: rateType !== 'Non-refundable',
      breakfastIncluded: section.toLowerCase().includes('breakfast'),
      freeCancellation: section.toLowerCase().includes('free cancellation'),
      paymentType: section.toLowerCase().includes('pay at property') ? 'at_property' : 'online'
    });
  }
  
  return rates;
}

/**
 * Compare room rates and highlight best value
 */
function compareRoomRates(rooms) {
  if (!rooms || rooms.length === 0) {
    return { bestValue: null, cheapest: null, comparison: [] };
  }
  
  // Find cheapest rate
  let cheapest = null;
  let lowestPrice = Infinity;
  
  // Find best value (rating/price ratio equivalent for rooms)
  let bestValue = null;
  let bestValueScore = 0;
  
  rooms.forEach(room => {
    if (room.rates && room.rates.length > 0) {
      const lowestRate = room.rates.reduce((min, rate) => 
        rate.perNight < min.perNight ? rate : min, room.rates[0]);
      
      // Cheapest
      if (lowestRate.perNight < lowestPrice) {
        lowestPrice = lowestRate.perNight;
        cheapest = { room, rate: lowestRate };
      }
      
      // Best value (more amenities = better value)
      const amenityScore = room.amenities ? room.amenities.length : 0;
      const valueScore = amenityScore / lowestRate.perNight;
      
      if (valueScore > bestValueScore) {
        bestValueScore = valueScore;
        bestValue = { room, rate: lowestRate };
      }
    }
  });
  
  return {
    bestValue,
    cheapest,
    comparison: rooms.map(room => ({
      name: room.name,
      lowestRate: room.rates && room.rates.length > 0 ? 
        Math.min(...room.rates.map(r => r.perNight)) : null,
      amenities: room.amenities ? room.amenities.length : 0,
      available: room.available
    }))
  };
}

/**
 * Format room options for display
 */
function formatRoomOptions(rooms, options = {}) {
  const topN = options.top || 5;
  const topRooms = rooms.slice(0, topN);
  
  const formatted = topRooms.map((room, index) => {
    const lines = [];
    
    // Room name and index
    lines.push(`${index + 1}. ${room.name || 'Room ' + (index + 1)}`);
    
    // Size
    if (room.size) {
      lines.push(`   📐 ${room.size.value}${room.size.unit}`);
    }
    
    // Beds
    if (room.beds) {
      lines.push(`   🛏️  ${room.beds.count} ${room.beds.type} bed(s)`);
    }
    
    // Occupancy
    if (room.maxOccupancy) {
      lines.push(`   👥 Sleeps ${room.maxOccupancy}`);
    }
    
    // Amenities (top 3)
    if (room.amenities && room.amenities.length > 0) {
      lines.push(`   🏨 ${room.amenities.slice(0, 3).join(' • ')}`);
      if (room.amenities.length > 3) {
        lines.push(`      ... and ${room.amenities.length - 3} more`);
      }
    }
    
    // Rates
    if (room.rates && room.rates.length > 0) {
      const lowestRate = room.rates.reduce((min, rate) => 
        rate.perNight < min.perNight ? rate : min, room.rates[0]);
      
      lines.push(`   💰 $${lowestRate.perNight}/night`);
      
      if (lowestRate.refundable) {
        lines.push(`   ✅ Free cancellation`);
      }
      
      if (lowestRate.breakfastIncluded) {
        lines.push(`   🥐 Breakfast included`);
      }
    }
    
    // Availability
    if (!room.available) {
      lines.push(`   ❌ Sold out`);
    }
    
    return lines.join('\n');
  });
  
  return formatted.join('\n\n');
}

/**
 * Select a room and proceed to reservation
 */
async function selectRoom(browser, roomIndex) {
  try {
    console.log(`🛏️  Selecting room #${roomIndex}...`);
    
    // This would click the "I'll reserve" button for the selected room
    // Implementation depends on actual booking.com UI structure
    
    console.log('✅ Room selected - proceeding to guest details');
    
    return {
      success: true,
      roomIndex: roomIndex,
      nextStep: 'guest_details'
    };
    
  } catch (error) {
    console.error('❌ Error selecting room:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Export for use in other modules
module.exports = {
  extractRoomOptions,
  parseRoomsFromSnapshot,
  extractRoomFromSection,
  extractRoomAmenities,
  extractRoomRates,
  compareRoomRates,
  formatRoomOptions,
  selectRoom
};

// CLI mode for testing
if (require.main === module) {
  console.log('Room Options Extractor Module');
  console.log('\nUsage:');
  console.log('  const { extractRoomOptions, formatRoomOptions } = require("./room-extractor.js");');
  console.log('  const rooms = await extractRoomOptions(browser);');
  console.log('  console.log(formatRoomOptions(rooms, { top: 3 }));');
}
