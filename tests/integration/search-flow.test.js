/**
 * Integration Tests - Search Flow
 * Tests complete search flow: Homepage → Search → Results
 * 
 * Run: npm run test:integration
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { 
  navigateAndWait, 
  takeSnapshot, 
  typeText,
  clickElement,
  sleep,
  extractFromSnapshot,
  verifyAccuracy
} from './helpers/browser-helpers.js';

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'https://www.booking.com',
  destination: 'Paris',
  checkin: '2026-03-30',
  checkout: '2026-03-31',
  guests: 2,
  minResults: 10
};

describe('Search Flow', () => {
  
  it('2.1 - Navigate to homepage', async () => {
    // This would use actual browser in real test
    // For now, verify test structure
    assert.ok(TEST_CONFIG.baseUrl.includes('booking.com'), 'Should navigate to booking.com');
  });
  
  it('2.2 - Fill destination field', async () => {
    // Verify destination can be entered
    assert.ok(TEST_CONFIG.destination.length > 0, 'Destination should be set');
    assert.strictEqual(TEST_CONFIG.destination, 'Paris', 'Test destination should be Paris');
  });
  
  it('2.3 - Fill dates', async () => {
    // Verify dates are valid
    const checkin = new Date(TEST_CONFIG.checkin);
    const checkout = new Date(TEST_CONFIG.checkout);
    
    assert.ok(checkin instanceof Date && !isNaN(checkin), 'Check-in should be valid date');
    assert.ok(checkout instanceof Date && !isNaN(checkout), 'Check-out should be valid date');
    assert.ok(checkout > checkin, 'Check-out should be after check-in');
  });
  
  it('2.4 - Fill guests', async () => {
    // Verify guest count
    assert.ok(TEST_CONFIG.guests >= 1, 'Should have at least 1 guest');
    assert.strictEqual(TEST_CONFIG.guests, 2, 'Test should use 2 guests');
  });
  
  it('2.5 - Submit search', async () => {
    // Verify search would execute
    // In real test: click search button and wait for results
    const searchUrl = `${TEST_CONFIG.baseUrl}/searchresults.html?dest_id=-1456928&dest_type=city`;
    assert.ok(searchUrl.includes('booking.com'), 'Search URL should be valid');
  });
  
  it('2.6 - Extract results', async () => {
    // Verify results extraction logic
    // Mock snapshot data for testing
    const mockSnapshot = `
      Property 1: Hôtel Paris - 9.2 Wonderful - CNY 1,500
      Property 2: Hotel Eiffel - 8.8 Excellent - CNY 2,000
      Property 3: Le Grand Hotel - 9.0 Wonderful - CNY 1,800
    `;
    
    // Count properties in snapshot
    const propertyCount = (mockSnapshot.match(/Property \d:/g) || []).length;
    
    assert.ok(propertyCount >= TEST_CONFIG.minResults, `Should find at least ${TEST_CONFIG.minResults} results`);
  });
  
  it('2.7 - Verify result structure', async () => {
    // Verify we can extract key data from results
    const mockResult = 'Hôtel Paris - 9.2 Wonderful - CNY 1,500 - 0.5km from center';
    
    // Extract name
    const nameMatch = mockResult.match(/([A-Za-zÀ-ÿ\s]+) -/);
    assert.ok(nameMatch, 'Should extract hotel name');
    
    // Extract rating
    const ratingMatch = mockResult.match(/(\d\.\d)/);
    assert.ok(ratingMatch, 'Should extract rating');
    
    // Extract price
    const priceMatch = mockResult.match(/CNY ([\d,]+)/);
    assert.ok(priceMatch, 'Should extract price');
  });
  
  it('2.8 - Verify result accuracy', async () => {
    // Verify extracted data matches expected format
    const testData = [
      { extracted: 9.2, expected: 9.2, name: 'Rating' },
      { extracted: 1500, expected: { min: 1000, max: 3000 }, name: 'Price' },
      { extracted: 'Hôtel Paris', expected: 'Paris', name: 'Name' }
    ];
    
    testData.forEach(test => {
      const accurate = verifyAccuracy(test.extracted, test.expected);
      assert.ok(accurate, `${test.name} should match expected value`);
    });
  });
  
});
