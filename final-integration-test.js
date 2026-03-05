#!/usr/bin/env node

/**
 * Final integration test with correct parameter structure
 */

const { run } = require('./index.js');

async function createOpenClawBrowserContext() {
  return {
    navigate: async (params) => {
      console.log(`[OpenClaw Browser] Navigate: ${JSON.stringify(params)}`);
      return { success: true };
    },
    
    act: async (params) => {
      console.log(`[OpenClaw Browser] Act: ${JSON.stringify(params)}`);
      return { success: true };
    },
    
    snapshot: async (params) => {
      console.log(`[OpenClaw Browser] Snapshot: ${JSON.stringify(params)}`);
      return 'booking.com mock snapshot';
    }
  };
}

async function testFinalIntegration() {
  console.log('=== Final OpenClaw Integration Test ===\n');
  
  try {
    const browser = await createOpenClawBrowserContext();
    
    // The key insight: the parsed dates are in checkIn/checkOut, not dates.checkIn/dates.checkOut
    // Let's test with the actual structure from parseSearchQuery
    const query = "Hotels in Tokyo, March 15-20, 2 guests";
    
    const result = await run({
      query: query,
      browser: browser,
      context: {
        useBrowserRelay: true,
        profile: 'chrome'
      }
    });
    
    console.log('\n=== Final Test Result ===');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\n✅ SUCCESS: OpenClaw skill integration works!');
    } else {
      console.log('\n❌ FAILURE: Integration issue remains');
      console.log('Error:', result.error);
    }
    
  } catch (error) {
    console.error('\n💥 EXCEPTION:', error.message);
  }
}

testFinalIntegration();