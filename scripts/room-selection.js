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
 * Click the "I'll reserve" button for a room using ARIA refs
 * Pattern: Find table "Select a room type...", then find Reserve button
 */
async function clickReserveButton(browser, roomIndex) {
  try {
    // Get snapshot with ARIA refs
    const snapshot = await browser.snapshot({
      profile: 'chrome',
      refs: 'aria'
    });
    
    if (!snapshot || !snapshot.elements) {
      throw new Error('Failed to get page snapshot');
    }
    
    console.log(`  🔍 Finding room ${roomIndex} reserve button...`);
    
    // Find the room selection table
    const roomTable = findRoomSelectionTable(snapshot.elements);
    
    if (!roomTable) {
      throw new Error('Room selection table not found');
    }
    
    // Find the specific room row and its reserve button
    const reserveButton = findReserveButtonInTable(roomTable, roomIndex);
    
    if (!reserveButton || !reserveButton.ref) {
      throw new Error(`Reserve button for room ${roomIndex} not found`);
    }
    
    console.log(`  🎯 Clicking Reserve (ref: ${reserveButton.ref})`);
    
    // Click using ARIA ref
    await browser.act({
      profile: 'chrome',
      request: {
        kind: 'click',
        ref: reserveButton.ref
      }
    });
    
    // Wait for navigation
    await sleep(1000);
    
  } catch (error) {
    throw new Error(`Failed to click reserve button: ${error.message}`);
  }
}

/**
 * Find the room selection table from snapshot elements
 * @param {Array} elements - Snapshot elements
 * @returns {Object|null} Room table element
 */
function findRoomSelectionTable(elements) {
  for (const element of elements) {
    // Look for table with room selection
    if (element.role === 'table') {
      const name = element.name || '';
      if (name.includes('Select a room') || name.includes('room type') || name.includes('Room')) {
        return element;
      }
    }
    
    // Check children
    if (element.children) {
      const found = findRoomSelectionTable(element.children);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Find reserve button for specific room in the table
 * @param {Object} tableElement - Room selection table
 * @param {number} roomIndex - 1-based room index
 * @returns {Object|null} Reserve button element
 */
function findReserveButtonInTable(tableElement, roomIndex) {
  if (!tableElement || !tableElement.children) return null;
  
  // Get the row at the specified index
  const rows = tableElement.children.filter(c => c.role === 'row' || c.role === 'rowgroup');
  
  // Handle both flat row structure and nested rowgroup
  let targetRow = null;
  let rowArray = [];
  
  if (rows.length > 0 && rows[0].role === 'rowgroup') {
    // Rows are nested in rowgroup
    for (const rowgroup of rows) {
      if (rowgroup.children) {
        rowArray.push(...rowgroup.children.filter(c => c.role === 'row'));
      }
    }
  } else {
    // Direct rows
    rowArray = rows;
  }
  
  // Get target row (1-indexed to 0-indexed)
  const targetRowIndex = roomIndex - 1;
  
  if (targetRowIndex < 0 || targetRowIndex >= rowArray.length) {
    // Fallback: search all rows for button
    return findButtonInRows(rowArray, 'Reserve');
  }
  
  targetRow = rowArray[targetRowIndex];
  
  // Find button in the target row
  return findButtonInElement(targetRow, 'Reserve');
}

/**
 * Find a button with specific text in an element
 * @param {Object} element - Element to search
 * @param {string} buttonText - Button text to find
 * @returns {Object|null} Button element
 */
function findButtonInElement(element, buttonText) {
  if (!element) return null;
  
  // Check if this element is the button
  if (element.role === 'button') {
    const name = element.name || '';
    if (name.includes(buttonText)) {
      return element;
    }
  }
  
  // Check children
  if (element.children) {
    for (const child of element.children) {
      const found = findButtonInElement(child, buttonText);
      if (found) return found;
    }
  }
  
  return null;
}

/**
 * Find button in array of rows
 * @param {Array} rows - Array of row elements
 * @param {string} buttonText - Button text to find
 * @returns {Object|null} Button element
 */
function findButtonInRows(rows, buttonText) {
  for (const row of rows) {
    const button = findButtonInElement(row, buttonText);
    if (button) return button;
  }
  return null;
}

/**
 * Select number of rooms using combobox
 * @param {Object} browser - Browser automation interface
 * @param {number} numRooms - Number of rooms to select
 * @returns {Promise<boolean>} Success status
 */
async function selectNumberOfRooms(browser, numRooms) {
  try {
    const snapshot = await browser.snapshot({
      profile: 'chrome',
      refs: 'aria'
    });
    
    if (!snapshot || !snapshot.elements) {
      throw new Error('Failed to get page snapshot');
    }
    
    // Find combobox "Select Rooms"
    const roomsCombobox = findCombobox(snapshot.elements, 'Select Rooms');
    
    if (!roomsCombobox || !roomsCombobox.ref) {
      console.warn('  ⚠️  Room selection combobox not found');
      return false;
    }
    
    console.log(`  🎯 Selecting ${numRooms} room(s) (ref: ${roomsCombobox.ref})`);
    
    // Click to open dropdown
    await browser.act({
      profile: 'chrome',
      request: {
        kind: 'click',
        ref: roomsCombobox.ref
      }
    });
    
    await sleep(500);
    
    // Type the number
    await browser.act({
      profile: 'chrome',
      request: {
        kind: 'type',
        ref: roomsCombobox.ref,
        text: numRooms.toString()
      }
    });
    
    await sleep(300);
    
    // Press Enter to confirm
    await browser.act({
      profile: 'chrome',
      request: {
        kind: 'press',
        key: 'Enter'
      }
    });
    
    await sleep(500);
    
    return true;
  } catch (error) {
    console.error('  ❌ Failed to select rooms:', error.message);
    return false;
  }
}

/**
 * Find a combobox by its label/name
 * @param {Array} elements - Snapshot elements
 * @param {string} name - Combobox name to find
 * @returns {Object|null} Combobox element
 */
function findCombobox(elements, name) {
  for (const element of elements) {
    if (element.role === 'combobox') {
      const elementName = element.name || '';
      if (elementName.includes(name)) {
        return element;
      }
    }
    
    if (element.children) {
      const found = findCombobox(element.children, name);
      if (found) return found;
    }
  }
  return null;
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
  selectNumberOfRooms,
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
