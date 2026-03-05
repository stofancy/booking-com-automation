#!/usr/bin/env node

/**
 * Test script to verify booking-com-automation skill works with Browser Relay
 */

const { run } = require('./index.js');

async function testWithBrowserRelay() {
  console.log('Testing booking-com-automation with Browser Relay...');
  
  // Simulate the browser context that OpenClaw would pass
  // In real usage, this would come from the browser tool
  const mockBrowserContext = {
    profile: 'chrome',
    targetId: '7E2949EAD64D49D7D34A6433B5464302', // From our active tab
    type: 'page'
  };
  
  try {
    const result = await run({
      query: "Hotels in Tokyo, March 15-20, 2 guests",
      browser: mockBrowserContext,
      context: { useBrowserRelay: true }
    });
    
    console.log('Result:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Browser Relay integration test PASSED');
    } else {
      console.log('❌ Browser Relay integration test FAILED');
      console.log('Error:', result.error, result.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed with exception:', error.message);
  }
}

// Run the test
testWithBrowserRelay();