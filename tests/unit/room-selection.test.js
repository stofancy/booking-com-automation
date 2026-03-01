/**
 * Unit Tests for Room Selection
 * Tests the room-selection.js module
 * 
 * Run: npm test
 */

const assert = require('assert');
const { describe, it } = require('node:test');

// Import module
const roomSelection = require('../../scripts/room-selection.js');

describe('Room Selection', () => {
  
  describe('selectRoomAndReserve', () => {
    it('should handle empty rooms', async () => {
      const mockBrowser = {};
      const result = await roomSelection.selectRoomAndReserve(mockBrowser, [], 1);
      
      assert.strictEqual(result.success, false);
      assert.ok(result.error.includes('No rooms'));
    });
    
    it('should handle invalid room index', async () => {
      const mockBrowser = {};
      const rooms = [{ name: 'Room 1', available: true }];
      const result = await roomSelection.selectRoomAndReserve(mockBrowser, rooms, 5);
      
      assert.strictEqual(result.success, false);
      assert.ok(result.error.includes('Invalid'));
    });
    
    it('should handle sold out room', async () => {
      const mockBrowser = {};
      const rooms = [{ name: 'Room 1', available: false }];
      const result = await roomSelection.selectRoomAndReserve(mockBrowser, rooms, 1);
      
      assert.strictEqual(result.success, false);
      assert.ok(result.error.includes('sold out'));
    });
    
    it('should return success for available room', async () => {
      const mockBrowser = {
        snapshot: async () => 'guest details page with first name and email fields',
        act: async () => ({ success: true })
      };
      const rooms = [{ name: 'Room 1', available: true }];
      const result = await roomSelection.selectRoomAndReserve(mockBrowser, rooms, 1);
      
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.nextStep, 'guest_details');
    });
  });
  
  describe('presentRoomOptions', () => {
    it('should present rooms to user', () => {
      const rooms = [
        { name: 'Room 1', available: true },
        { name: 'Room 2', available: true }
      ];
      
      const result = roomSelection.presentRoomOptions(rooms);
      
      assert.ok(result);
      assert.strictEqual(result.totalRooms, 2);
      assert.ok(result.prompt);
    });
    
    it('should limit to top N rooms', () => {
      const rooms = Array(10).fill({ name: 'Room', available: true });
      
      const result = roomSelection.presentRoomOptions(rooms, { top: 3 });
      
      assert.strictEqual(result.shownRooms, 3);
    });
    
    it('should handle empty rooms', () => {
      const result = roomSelection.presentRoomOptions([]);
      
      assert.ok(result);
      assert.strictEqual(result.totalRooms, 0);
    });
  });
  
  describe('handleSoldOutRoom', () => {
    it('should suggest alternatives when available', () => {
      const rooms = [
        { name: 'Room 1', available: false },
        { name: 'Room 2', available: true },
        { name: 'Room 3', available: true }
      ];
      
      const result = roomSelection.handleSoldOutRoom(rooms, 1);
      
      assert.strictEqual(result.success, false);
      assert.strictEqual(result.availableRooms, 2);
      assert.ok(result.alternatives);
    });
    
    it('should handle no alternatives', () => {
      const rooms = [
        { name: 'Room 1', available: false },
        { name: 'Room 2', available: false }
      ];
      
      const result = roomSelection.handleSoldOutRoom(rooms, 1);
      
      assert.strictEqual(result.success, false);
      assert.ok(result.message.includes('No other rooms'));
    });
  });
  
  describe('handlePriceChange', () => {
    it('should calculate price increase', () => {
      const result = roomSelection.handlePriceChange(100, 120);
      
      assert.strictEqual(result.originalPrice, 100);
      assert.strictEqual(result.newPrice, 120);
      assert.strictEqual(result.priceDiff, 20);
      assert.strictEqual(result.percentChange, '20.0');
      assert.strictEqual(result.action, 'confirm');
    });
    
    it('should calculate price decrease', () => {
      const result = roomSelection.handlePriceChange(100, 80);
      
      assert.strictEqual(result.priceDiff, -20);
      assert.ok(result.percentChange.includes('-'));
      assert.strictEqual(result.action, 'inform');
    });
    
    it('should handle no change', () => {
      const result = roomSelection.handlePriceChange(100, 100);
      
      assert.strictEqual(result.priceDiff, 0);
      assert.strictEqual(result.percentChange, '0.0');
    });
  });
  
  describe('verifyGuestDetailsPage', () => {
    it('should verify page loaded', () => {
      const snapshot = 'Guest details page with First name, Last name, and Email address fields';
      
      const result = roomSelection.verifyGuestDetailsPage(snapshot);
      
      assert.strictEqual(result.loaded, true);
      assert.ok(result.message.includes('successfully'));
    });
    
    it('should detect missing fields', () => {
      const snapshot = 'Page with First name only';
      
      const result = roomSelection.verifyGuestDetailsPage(snapshot);
      
      assert.strictEqual(result.loaded, false);
      assert.ok(result.error.includes('Missing'));
    });
    
    it('should handle null snapshot', () => {
      const result = roomSelection.verifyGuestDetailsPage(null);
      
      assert.strictEqual(result.loaded, false);
      assert.ok(result.error);
    });
    
    it('should handle empty snapshot', () => {
      const result = roomSelection.verifyGuestDetailsPage('');
      
      assert.strictEqual(result.loaded, false);
    });
  });
  
  describe('waitForGuestDetailsPage', () => {
    it('should return true when page loads', async () => {
      const mockBrowser = {
        snapshot: async () => 'Guest details with First name and Email'
      };
      
      const result = await roomSelection.waitForGuestDetailsPage(mockBrowser, 5000);
      
      assert.strictEqual(result, true);
    });
    
    it('should return false on timeout', async () => {
      const mockBrowser = {
        snapshot: async () => 'Still loading...'
      };
      
      const result = await roomSelection.waitForGuestDetailsPage(mockBrowser, 1000);
      
      assert.strictEqual(result, false);
    });
  });
  
  describe('sleep helper', () => {
    it('should delay execution', async () => {
      const start = Date.now();
      await roomSelection.sleep(100);
      const end = Date.now();
      const duration = end - start;
      assert.ok(duration >= 90, `Sleep should be at least 90ms, was ${duration}ms`);
      assert.ok(duration < 200, `Sleep should be less than 200ms, was ${duration}ms`);
    });
  });

});
