#!/usr/bin/env node

/**
 * Room Selection for booking.com
 * Handles room selection and navigation to guest details page
 * 
 * Usage:
 *   const { selectRoomAndReserve } = require('./room-selection.js');
 *   const result = await selectRoomAndReserve(browser, rooms, 1);
 */

/**
 * Select a room and proceed to reservation
 * @param {Object} browser - Browser automation interface
 * @param {Array} rooms - Array of room options
 * @param {number} roomIndex - Index of room to select (1-based)
 * @returns {Promise<Object>} Selection result
 */
async function selectRoomAndReserve(browser, rooms, roomIndex) {
  try {
    console.log(`🛏️  Selecting room #${roomIndex}...`);
    
    // Validate input
    if (!rooms || rooms.length === 0) {
      throw new Error('No rooms available to select');
    }
    
    if (roomIndex < 1 || roomIndex > rooms.length) {
      throw new Error(`Invalid room index ${roomIndex}. Must be between 1 and ${rooms.length}`);
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
    console.log(`  📍 Clicking "I'll reserve" for ${selectedRoom.name || `Room ${roomIndex}`}`);
    await clickReserveButton(browser, roomIndex);
    
    // Wait for guest details page to load
    console.log('  ⏳ Navigating to guest details page...');
    const loaded = await waitForGuestDetailsPage(browser);
    
    if (!loaded) {
      throw new Error('Failed to load guest details page');
    }
    
    console.log('✅ Room selected - on guest details page');
    
    return {
      success: true,
      roomIndex: roomIndex,
      roomName: selectedRoom.name,
      nextStep: 'guest_details',
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error selecting room:', error.message);
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
 */
async function clickReserveButton(browser, roomIndex) {
  try {
    // Get snapshot to find the reserve button
    const snapshot = await browser.snapshot({
      profile: 'chrome',
      refs: 'aria'
    });
    
    // Look for reserve button for specific room
    // This would use actual booking.com selectors
    await browser.act({
      profile: 'chrome',
      request: {
        kind: 'click',
        selector: `[data-testid="reserve-button"]:nth-child(${roomIndex})`
      }
    });
    
  } catch (error) {
    throw new Error(`Failed to click reserve button: ${error.message}`);
  }
}

/**
 * Wait for guest details page to load
 */
async function waitForGuestDetailsPage(browser, timeout = 15000) {
  const start = Date.now();
  
  while (Date.now() - start < timeout) {
    try {
      const snapshot = await browser.snapshot({
        profile: 'chrome',
        refs: 'aria'
      });
      
      // Check for guest details page indicators
      if (snapshot && (
        snapshot.includes('guest details') ||
        snapshot.includes('Your details') ||
        snapshot.includes('Guest information') ||
        snapshot.includes('First name') ||
        snapshot.includes('Last name') ||
        snapshot.includes('Email address')
      )) {
        return true;
      }
    } catch (error) {
      // Page not ready yet
    }
    
    await sleep(1000);
  }
  
  return false;
}

/**
 * Present room options to user and get selection
 */
function presentRoomOptions(rooms, options = {}) {
  const topN = options.top || Math.min(5, rooms.length);
  const topRooms = rooms.slice(0, topN);
  
  console.log('\n🏨 Available Rooms:\n');
  
  topRooms.forEach((room, index) => {
    console.log(`${index + 1}. ${room.name || `Room ${index + 1}`}`);
    
    if (room.size) {
      console.log(`   📐 ${room.size.value}${room.size.unit}`);
    }
    
    if (room.beds) {
      console.log(`   🛏️  ${room.beds.count} ${room.beds.type} bed(s)`);
    }
    
    if (room.maxOccupancy) {
      console.log(`   👥 Sleeps ${room.maxOccupancy}`);
    }
    
    if (room.amenities && room.amenities.length > 0) {
      console.log(`   🏨 ${room.amenities.slice(0, 3).join(' • ')}`);
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
 */
function verifyGuestDetailsPage(snapshot) {
  if (!snapshot) {
    return {
      loaded: false,
      error: 'No page content'
    };
  }
  
  const requiredFields = [
    'First name',
    'Last name',
    'Email'
  ];
  
  const missingFields = requiredFields.filter(field => 
    !snapshot.includes(field)
  );
  
  if (missingFields.length > 0) {
    return {
      loaded: false,
      error: `Missing fields: ${missingFields.join(', ')}`
    };
  }
  
  return {
    loaded: true,
    fieldsFound: requiredFields.length,
    message: 'Guest details page loaded successfully'
  };
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
  sleep
};

// CLI mode for testing
if (require.main === module) {
  console.log('Room Selection Module');
  console.log('\nUsage:');
  console.log('  const { selectRoomAndReserve, presentRoomOptions } = require("./room-selection.js");');
  console.log('  presentRoomOptions(rooms);');
  console.log('  const result = await selectRoomAndReserve(browser, rooms, 1);');
}
