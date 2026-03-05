#!/usr/bin/env node

/**
 * Room Selection for booking.com
 * Handles room selection and navigation to guest details page
 * Uses Playwright for browser automation
 *
 * Usage:
 *   const { selectRoomAndReserve } = require('./room-selection.js');
 *   const result = await selectRoomAndReserve(page, rooms, 1);
 */

/**
 * Select a room and proceed to reservation
 * @param {Object} page - Playwright page object
 * @param {Array} rooms - Array of room options
 * @param {number} roomIndex - Index of room to select (1-based)
 * @returns {Promise<Object>} Selection result
 */
async function selectRoomAndReserve(page, rooms, roomIndex) {
  try {
    console.log(`Selecting room #${roomIndex}...`);

    // Validate input
    if (!rooms || rooms.length === 0) {
      throw new Error('No rooms available to select');
    }

    if (roomIndex < 1 || roomIndex > rooms.length) {
      throw new Error(` Invalid room index ${roomIndex}. Must be between 1 and ${rooms.length}`);
    }

    const selectedRoom = rooms[roomIndex - 1];

    // Check if room is available
    if (!selectedRoom.available) {
      return {
        success: false,
        error: 'Selected room is sold out',
        suggestion: 'Please select a different room'
      };
    }

    // Click "I'll reserve" button
    console.log(`  Clicking "I'll reserve" for ${selectedRoom.name || `Room ${roomIndex}`}`);
    await clickReserveButton(page, roomIndex);

    // Wait for guest details page to load
    console.log('  Navigating to guest details page...');
    const loaded = await waitForGuestDetailsPage(page);

    if (!loaded) {
      throw new Error('Failed to load guest details page');
    }

    console.log('Room selected - on guest details page');

    return {
      success: true,
      roomIndex: roomIndex,
      roomName: selectedRoom.name,
      nextStep: 'guest_details',
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error selecting room:', error.message);
    return {
      success: false,
      error: error.message,
      roomIndex: roomIndex,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Click the "I'll reserve" button for a room
 * @param {Object} page - Playwright page object
 * @param {number} roomIndex - 1-based room index
 */
async function clickReserveButton(page, roomIndex) {
  try {
    // Try to find reserve button - common selectors
    const selectors = [
      `button:has-text("I'll reserve")`,
      'button:has-text("Reserve")',
      '[data-testid="reserve-button"]',
      '.b-button button'
    ];

    for (const selector of selectors) {
      const buttons = await page.locator(selector).all();
      if (buttons.length >= roomIndex) {
        const btn = buttons[roomIndex - 1];
        if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await btn.click();
          await sleep(1000);
          console.log('  Clicked reserve button');
          return;
        }
      }
    }

    // Fallback: click first visible reserve button
    const fallbackBtn = page.locator('button:has-text("Reserve")').first();
    if (await fallbackBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await fallbackBtn.click();
      await sleep(1000);
      console.log('  Clicked first reserve button');
      return;
    }

    throw new Error('Reserve button not found');

  } catch (error) {
    throw new Error(`Failed to click reserve button: ${error.message}`);
  }
}

/**
 * Select number of rooms using dropdown
 * @param {Object} page - Playwright page object
 * @param {number} numRooms - Number of rooms to select
 * @returns {Promise<boolean>} Success status
 */
async function selectNumberOfRooms(page, numRooms) {
  try {
    // Try to find room selector
    const selectors = [
      '[data-testid="room-selector"]',
      'select[name="rooms"]',
      '.room-select'
    ];

    for (const selector of selectors) {
      const select = page.locator(selector);
      if (await select.isVisible({ timeout: 2000 }).catch(() => false)) {
        await select.selectOption(numRooms.toString());
        await sleep(500);
        console.log(`  Selected ${numRooms} room(s)`);
        return true;
      }
    }

    console.warn('  Room selection not found');
    return false;

  } catch (error) {
    console.error('  Failed to select rooms:', error.message);
    return false;
  }
}

/**
 * Wait for guest details page to load
 * @param {Object} page - Playwright page object
 */
async function waitForGuestDetailsPage(page, timeout = 15000) {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    try {
      const url = page.url();

      // Check for guest details URL pattern
      if (url.includes('checkout') || url.includes('guestdetails') || url.includes('booking')) {
        await page.waitForLoadState('domcontentloaded');
        return true;
      }

      // Check for form fields
      const hasForm = await page.locator('input[name="firstname"], input[name="email"]').isVisible().catch(() => false);
      if (hasForm) {
        return true;
      }

    } catch (error) {
      // Page not ready yet
    }

    await sleep(500);
  }

  return false;
}

/**
 * Present room options to user and get selection
 */
function presentRoomOptions(rooms, options = {}) {
  const topN = options.top || Math.min(5, rooms.length);
  const topRooms = rooms.slice(0, topN);

  console.log('\nAvailable Rooms:\n');

  topRooms.forEach((room, index) => {
    console.log(`${index + 1}. ${room.name || `Room ${index + 1}`}`);

    if (room.size) {
      console.log(`   ${room.size.value}${room.size.unit}`);
    }

    if (room.beds) {
      console.log(`   🛏️  ${room.beds.count} ${room.beds.type} bed(s)`);
    }

    if (room.maxOccupancy) {
      console.log(`   👥 Sleeps ${room.maxOccupancy}`);
    }

    if (room.amenities && room.amenities.length > 0) {
      console.log(`   ${room.amenities.slice(0, 3).join(' • ')}`);
    }

    if (room.rates && room.rates.length > 0) {
      const lowestRate = room.rates.reduce((min, rate) =>
        rate.perNight < min.perNight ? rate : min, room.rates[0]);

      console.log(`   💰 $${lowestRate.perNight}/night`);

      if (lowestRate.freeCancellation) {
        console.log(`   ✅ Free cancellation`);
      }

      if (lowestRate.breakfastIncluded) {
        console.log(`   🥐 Breakfast included`);
      }
    }

    if (!room.available) {
      console.log(`   ❌ Sold out`);
    }

    console.log('');
  });

  return {
    totalRooms: rooms.length,
    shownRooms: topRooms.length,
    prompt: `Select a room (1-${topRooms.length}): `
  };
}

/**
 * Handle sold out room scenario
 */
function handleSoldOutRoom(rooms, selectedRoomIndex) {
  const availableRooms = rooms.filter((r, i) =>
    i !== selectedRoomIndex - 1 && r.available
  );

  if (availableRooms.length === 0) {
    return {
      success: false,
      message: 'No other rooms available',
      suggestion: 'Try different dates or property'
    };
  }

  return {
    success: false,
    message: `Selected room is sold out`,
    availableRooms: availableRooms.length,
    suggestion: `Please select from ${availableRooms.length} other available room(s)`,
    alternatives: availableRooms.map((r, i) => ({
      index: i + 1,
      name: r.name,
      price: r.rates && r.rates.length > 0 ? r.rates[0].perNight : null
    }))
  };
}

/**
 * Handle price change scenario
 */
function handlePriceChange(originalPrice, newPrice) {
  const priceDiff = newPrice - originalPrice;
  const percentChange = ((priceDiff / originalPrice) * 100).toFixed(1);

  return {
    originalPrice: originalPrice,
    newPrice: newPrice,
    priceDiff: priceDiff,
    percentChange: percentChange,
    message: `Price changed from $${originalPrice} to $${newPrice} (${percentChange > 0 ? '+' : ''}${percentChange}%)`,
    action: priceDiff > 0 ? 'confirm' : 'inform'
  };
}

/**
 * Verify guest details page loaded correctly
 * @param {Object} page - Playwright page object
 */
async function verifyGuestDetailsPage(page) {
  try {
    // Check for form fields
    const firstName = await page.locator('input[name="firstname"]').isVisible().catch(() => false);
    const lastName = await page.locator('input[name="lastname"]').isVisible().catch(() => false);
    const email = await page.locator('input[name="email"]').isVisible().catch(() => false);

    const fieldsFound = [firstName, lastName, email].filter(Boolean).length;

    if (fieldsFound < 2) {
      return {
        loaded: false,
        error: 'Missing guest form fields'
      };
    }

    return {
      loaded: true,
      fieldsFound: fieldsFound,
      message: 'Guest details page loaded successfully'
    };

  } catch (error) {
    return {
      loaded: false,
      error: error.message
    };
  }
}

/**
 * Sleep helper
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Export for use in other modules
module.exports = {
  selectRoomAndReserve,
  clickReserveButton,
  waitForGuestDetailsPage,
  presentRoomOptions,
  handleSoldOutRoom,
  handlePriceChange,
  verifyGuestDetailsPage,
  selectNumberOfRooms,
  sleep
};

// CLI mode for testing
if (require.main === module) {
  console.log('Room Selection Module');
  console.log('\nUsage:');
  console.log('  const { selectRoomAndReserve, presentRoomOptions } = require("./room-selection.js");');
  console.log('  presentRoomOptions(rooms);');
  console.log('  const result = await selectRoomAndReserve(page, rooms, 1);');
}
