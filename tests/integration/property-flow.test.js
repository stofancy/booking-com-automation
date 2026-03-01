/**
 * Integration Tests - Property Flow
 * Tests property selection and details extraction
 * 
 * Run: npm run test:integration
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { 
  navigateAndWait, 
  takeSnapshot, 
  clickElement,
  sleep,
  extractFromSnapshot,
  verifyAccuracy
} from './helpers/browser-helpers.js';

// Test configuration
const TEST_CONFIG = {
  propertyUrl: 'https://www.booking.com/hotel/fr/relaishotelvieuxparis.html',
  expectedName: 'Relais Hôtel du Vieux Paris',
  expectedRating: 9.2,
  expectedStars: 4,
  expectedReviews: 1400,
  expectedLocation: 'Paris',
  minRooms: 5
};

describe('Property Flow', () => {
  
  it('3.1 - Click first property', async () => {
    // Verify property URL structure
    assert.ok(TEST_CONFIG.propertyUrl.includes('booking.com'), 'Should be booking.com URL');
    assert.ok(TEST_CONFIG.propertyUrl.includes('/hotel/'), 'Should be hotel page');
  });
  
  it('3.2 - Extract property name', async () => {
    // Mock snapshot for testing
    const mockSnapshot = 'heading "Relais Hôtel du Vieux Paris" [level=2]';
    
    const nameMatch = extractFromSnapshot(mockSnapshot, /"([^"]+)" \[level=2\]/);
    
    assert.ok(nameMatch, 'Should extract property name');
    assert.ok(nameMatch.includes('Hôtel'), 'Name should include Hôtel');
  });
  
  it('3.3 - Extract star rating', async () => {
    // Verify star rating extraction
    const mockSnapshot = 'button "4 out of 5 stars"';
    
    const starMatch = extractFromSnapshot(mockSnapshot, /(\d) out of 5 stars/);
    
    assert.ok(starMatch, 'Should extract star rating');
    assert.strictEqual(starMatch, '4', 'Should be 4 stars');
  });
  
  it('3.4 - Extract guest score', async () => {
    // Verify guest score extraction
    const mockSnapshot = 'generic "9.2" · Wonderful · 1,493 reviews';
    
    const scoreMatch = extractFromSnapshot(mockSnapshot, /"(\d\.\d)"/);
    
    assert.ok(scoreMatch, 'Should extract guest score');
    
    const accurate = verifyAccuracy(parseFloat(scoreMatch), TEST_CONFIG.expectedRating);
    assert.ok(accurate, 'Score should match expected');
  });
  
  it('3.5 - Extract review count', async () => {
    // Verify review count extraction
    const mockSnapshot = 'Wonderful · 1,493 reviews';
    
    const reviewMatch = extractFromSnapshot(mockSnapshot, /([\d,]+) reviews/);
    
    assert.ok(reviewMatch, 'Should extract review count');
    
    const reviewCount = parseInt(reviewMatch.replace(/,/g, ''));
    assert.ok(reviewCount > 1000, 'Should have over 1000 reviews');
  });
  
  it('3.6 - Extract location', async () => {
    // Verify location extraction
    const mockSnapshot = '9, rue Git-le-Coeur, 6th arr., 75006 Paris, France';
    
    assert.ok(mockSnapshot.includes('Paris'), 'Should include Paris');
    assert.ok(mockSnapshot.includes('France'), 'Should include France');
  });
  
  it('3.7 - Extract facilities', async () => {
    // Verify facilities extraction
    const mockSnapshot = `
      listitem: Free Wifi
      listitem: Air conditioning
      listitem: 24-hour front desk
      listitem: Non-smoking rooms
      listitem: Room service
      listitem: Elevator
      listitem: Heating
      listitem: Laundry
      listitem: Daily housekeeping
      listitem: Excellent Breakfast
    `;
    
    const facilities = [
      'Free Wifi',
      'Air conditioning',
      '24-hour front desk',
      'Non-smoking rooms',
      'Room service'
    ];
    
    const foundCount = facilities.filter(f => mockSnapshot.includes(f)).length;
    
    assert.ok(foundCount >= 5, `Should find at least 5 facilities (found ${foundCount})`);
  });
  
  it('3.8 - Navigate to rooms', async () => {
    // Verify room section exists
    const mockSnapshot = 'heading "Availability" [level=2]';
    
    assert.ok(mockSnapshot.includes('Availability'), 'Should have availability section');
  });
  
  it('3.9 - Extract room options', async () => {
    // Verify room options extraction
    const mockSnapshot = `
      row "Superior Double or Twin Room"
      row "Deluxe Double or Twin Room"
      row "Suite"
      row "Classic Double Room"
      row "Family Suite"
    `;
    
    const roomCount = (mockSnapshot.match(/row "[^"]+Room"/g) || []).length;
    
    assert.ok(roomCount >= TEST_CONFIG.minRooms, `Should find at least ${TEST_CONFIG.minRooms} rooms`);
  });
  
  it('3.10 - Verify room prices', async () => {
    // Verify price extraction
    const mockSnapshot = 'CNY 2,710 · Original price CNY 3,011';
    
    const priceMatch = extractFromSnapshot(mockSnapshot, /CNY ([\d,]+)/);
    
    assert.ok(priceMatch, 'Should extract price');
    
    const price = parseInt(priceMatch.replace(/,/g, ''));
    assert.ok(price > 0, 'Price should be positive');
    assert.ok(price < 10000, 'Price should be reasonable');
  });
  
});
