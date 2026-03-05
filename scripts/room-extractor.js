#!/usr/bin/env node

/**
 * Room Options Extractor for booking.com
 * Extracts available rooms and rate options from property details page
 * Uses Playwright for browser automation
 *
 * Usage:
 *   const { extractRoomOptions } = require('./room-extractor.js');
 *   const rooms = await extractRoomOptions(page);
 */

/**
 * Extract all available room options from current page
 * @param {Object} page - Playwright page object
 * @returns {Promise<Array>} Array of room option objects
 */
async function extractRoomOptions(page) {
  try {
    console.log('Extracting room options...');

    // Extract room data using page.evaluate
    const rooms = await page.evaluate(() => {
      const rooms = [];

      // Find all room blocks - booking.com uses various selectors
      const roomSelectors = [
        '.hotel-hero-room-table tr[data-room-id]',
        '[data-testid="room-list"] > div',
        '.room-card',
        '.roomrow',
        'div[data-block-id="roomlist"] .prco-valign-middle-helper'
      ];

      let roomElements = [];
      for (const selector of roomSelectors) {
        roomElements = document.querySelectorAll(selector);
        if (roomElements.length > 0) break;
      }

      // Fallback: find all elements containing room-related info
      if (roomElements.length === 0) {
        const allDivs = document.querySelectorAll('div');
        roomElements = Array.from(allDivs).filter(el => {
          const text = el.innerText.toLowerCase();
          return text.includes('room') && text.includes('$');
        });
      }

      roomElements.forEach((el, index) => {
        const text = el.innerText;

        // Skip if not a real room element
        if (!text.includes('$') && !text.includes('per night')) return;

        const room = {
          index: index + 1,
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
        const nameEl = el.querySelector('h3, h4, [class*="room-name"], [class*="roomtype"]');
        if (nameEl) {
          room.name = nameEl.textContent.trim();
        }
        if (!room.name) {
          const nameMatch = text.match(/([A-Z][a-zA-Z\s&]+(?:Room|Suite|Studio|Apartment))/i);
          if (nameMatch) room.name = nameMatch[1].trim();
        }

        // Extract room size
        const sizeMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:m²|sqm|sq\.?ft\.?|square\s*(?:meters?|feet))/i);
        if (sizeMatch) {
          room.size = {
            value: parseFloat(sizeMatch[1]),
            unit: sizeMatch[0].includes('m²') || sizeMatch[0].includes('sqm') ? 'm²' : 'sqft'
          };
        }

        // Extract bed info
        const bedMatch = text.match(/(\d+)\s*(?:bed|beds)/i);
        if (bedMatch) {
          room.beds = {
            count: parseInt(bedMatch[1]),
            type: text.includes('double') ? 'double' : text.includes('king') ? 'king' : 'standard'
          };
        }

        // Extract occupancy
        const occupancyMatch = text.match(/(?:sleeps|max\.?\s*occupancy)[:\s]*(\d+)/i);
        if (occupancyMatch) {
          room.maxOccupancy = parseInt(occupancyMatch[1]);
        }

        // Extract amenities
        const amenityKeywords = [
          'air conditioning', 'wifi', 'tv', 'minibar', 'safe', 'balcony',
          'city view', 'soundproof', 'desk', 'coffee machine', 'hairdryer'
        ];
        room.amenities = amenityKeywords.filter(a => text.includes(a));

        // Extract prices
        const priceMatches = [...text.matchAll(/[\$\€\£]\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/g)];
        if (priceMatches.length > 0) {
          const perNight = parseFloat(priceMatches[0][1].replace(/,/g, ''));

          // Determine rate type
          let rateType = 'Standard';
          if (text.includes('free cancellation')) rateType = 'Flexible';
          else if (text.includes('non-refundable')) rateType = 'Non-refundable';
          else if (text.includes('breakfast')) rateType = 'Breakfast included';

          room.rates.push({
            type: rateType,
            perNight: perNight,
            total: perNight * 3,
            currency: text.includes('€') ? 'EUR' : text.includes('£') ? 'GBP' : 'USD',
            refundable: !text.includes('non-refundable'),
            breakfastIncluded: text.includes('breakfast'),
            freeCancellation: text.includes('free cancellation')
          });
        }

        // Check availability
        room.available = !text.includes('sold out') && !text.includes('not available');

        if (room.name || room.rates.length > 0) {
          rooms.push(room);
        }
      });

      return rooms;
    });

    console.log(`Extracted ${rooms.length} room options`);
    return rooms;

  } catch (error) {
    console.error('Error extracting room options:', error.message);
    return [];
  }
}

/**
 * Compare room rates and highlight best value
 */
function compareRoomRates(rooms) {
  if (!rooms || rooms.length === 0) {
    return { bestValue: null, cheapest: null, comparison: [] };
  }

  let cheapest = null;
  let lowestPrice = Infinity;
  let bestValue = null;
  let bestValueScore = 0;

  rooms.forEach(room => {
    if (room.rates && room.rates.length > 0) {
      const lowestRate = room.rates.reduce((min, rate) =>
        rate.perNight < min.perNight ? rate : min, room.rates[0]);

      if (lowestRate.perNight < lowestPrice) {
        lowestPrice = lowestRate.perNight;
        cheapest = { room, rate: lowestRate };
      }

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

    lines.push(`${index + 1}. ${room.name || 'Room ' + (index + 1)}`);

    if (room.size) {
      lines.push(`   ${room.size.value}${room.size.unit}`);
    }

    if (room.beds) {
      lines.push(`   ${room.beds.count} ${room.beds.type} bed(s)`);
    }

    if (room.maxOccupancy) {
      lines.push(`   Sleeps ${room.maxOccupancy}`);
    }

    if (room.amenities && room.amenities.length > 0) {
      lines.push(`   ${room.amenities.slice(0, 3).join(' • ')}`);
      if (room.amenities.length > 3) {
        lines.push(`      ... and ${room.amenities.length - 3} more`);
      }
    }

    if (room.rates && room.rates.length > 0) {
      const lowestRate = room.rates.reduce((min, rate =>
        rate.perNight < min.perNight ? rate : min), room.rates[0]);

      lines.push(`   $${lowestRate.perNight}/night`);

      if (lowestRate.refundable) {
        lines.push(`   Free cancellation`);
      }

      if (lowestRate.breakfastIncluded) {
        lines.push(`   Breakfast included`);
      }
    }

    if (!room.available) {
      lines.push(`   Sold out`);
    }

    return lines.join('\n');
  });

  return formatted.join('\n\n');
}

// Export for use in other modules
module.exports = {
  extractRoomOptions,
  compareRoomRates,
  formatRoomOptions
};

// CLI mode for testing
if (require.main === module) {
  console.log('Room Options Extractor Module');
  console.log('\nUsage:');
  console.log('  const { extractRoomOptions, formatRoomOptions } = require("./room-extractor.js");');
  console.log('  const rooms = await extractRoomOptions(page);');
  console.log('  console.log(formatRoomOptions(rooms, { top: 3 }));');
}
