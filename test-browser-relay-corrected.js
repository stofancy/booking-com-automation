#!/usr/bin/env node

/**
 * Corrected test script for booking-com-automation with Browser Relay
 * Uses the proper OpenClaw browser tool interface
 */

const { run } = require('./index.js');

async function testWithBrowserRelay() {
  console.log('Testing booking-com-automation with Browser Relay...');
  
  // Create proper browser context that matches OpenClaw's browser tool interface
  const browserContext = {
    // Browser tool methods that the skill expects
    navigate: async (params) => {
      const { profile, targetUrl } = params;
      console.log(`[BROWSER] navigate to ${targetUrl} in profile ${profile}`);
      // This would be handled by OpenClaw's actual browser tool integration
      return true;
    },
    
    act: async (params) => {
      const { profile, request } = params;
      console.log(`[BROWSER] act ${request.kind} in profile ${profile}`);
      // This would be handled by OpenClaw's actual browser tool integration
      return true;
    },
    
    snapshot: async (params) => {
      const { profile, refs } = params;
      console.log(`[BROWSER] snapshot from profile ${profile} with refs ${refs}`);
      // Return mock snapshot data
      return 'mock snapshot data';
    }
  };
  
  try {
    const result = await run({
      query: "Hotels in Tokyo, March 15-20, 2 guests",
      browser: browserContext,
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
    console.error('Stack:', error.stack);
  }
}

// Run the test
testWithBrowserRelay();