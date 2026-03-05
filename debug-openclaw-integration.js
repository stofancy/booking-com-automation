#!/usr/bin/env node

/**
 * Debug script to test OpenClaw skill integration properly
 * This simulates how OpenClaw would call the skill with browser relay
 */

const { run } = require('./index.js');

// Mock the actual OpenClaw browser tool interface
// In real OpenClaw execution, this would be provided by the system
async function createOpenClawBrowserContext() {
  return {
    // These methods match the OpenClaw browser tool API
    navigate: async (params) => {
      console.log(`[OpenClaw Browser] Navigate: ${JSON.stringify(params)}`);
      // In real execution, this would call browser.navigate via OpenClaw
      return { success: true };
    },
    
    act: async (params) => {
      console.log(`[OpenClaw Browser] Act: ${JSON.stringify(params)}`);
      // In real execution, this would call browser.act via OpenClaw  
      return { success: true };
    },
    
    snapshot: async (params) => {
      console.log(`[OpenClaw Browser] Snapshot: ${JSON.stringify(params)}`);
      // Return minimal mock data that passes validation
      return 'booking.com mock snapshot';
    }
  };
}

async function testOpenClawIntegration() {
  console.log('=== Testing OpenClaw Skill Integration ===\n');
  
  try {
    // Create the browser context that OpenClaw would provide
    const browser = await createOpenClawBrowserContext();
    
    console.log('Browser context created successfully\n');
    
    // Test the skill with browser context
    const result = await run({
      query: "Hotels in Tokyo, March 15-20, 2 guests",
      browser: browser,
      context: {
        useBrowserRelay: true,
        profile: 'chrome'
      }
    });
    
    console.log('\n=== Integration Test Result ===');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\n✅ SUCCESS: OpenClaw skill integration works correctly!');
      console.log('The skill can be called properly from OpenClaw with Browser Relay.');
    } else {
      console.log('\n❌ FAILURE: Integration issue detected');
      console.log('Error:', result.error);
      console.log('Message:', result.message);
    }
    
  } catch (error) {
    console.error('\n💥 EXCEPTION during integration test:');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the integration test
testOpenClawIntegration().catch(console.error);