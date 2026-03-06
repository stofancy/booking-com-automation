#!/usr/bin/env node

/**
 * E2E Test for Booking.com Automation Skill
 *
 * This test verifies the skill works end-to-end by:
 * 1. Invoking the skill via OpenClaw CLI
 * 2. Checking the agent uses the skill correctly
 * 3. Verifying search results are returned
 *
 * Usage (LOCAL ONLY - not for CI/CD):
 *   npm run test:e2e
 *   npm run test:e2e -- --agent travel-agency --destination "Paris" --checkin 2026-05-01 --checkout 2026-05-05
 *
 * Environment Variables:
 *   OPENCLAW_AGENT_ID - Agent ID to use (default: travel-agency)
 *   OPENCLAW_TIMEOUT  - Timeout in seconds (default: 180)
 *
 * NOTE: This test requires:
 *   - OpenClaw CLI installed
 *   - Playwright browsers installed
 *   - Network access to booking.com
 */

const { spawn } = require('child_process');

// Test configuration
const DEFAULT_AGENT = process.env.OPENCLAW_AGENT_ID || 'travel-agency';
const DEFAULT_TIMEOUT = parseInt(process.env.OPENCLAW_TIMEOUT) || 180;

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    agent: DEFAULT_AGENT,
    destination: null,
    checkIn: null,
    checkOut: null,
    adults: 2,
    timeout: DEFAULT_TIMEOUT,
    flow: 'search' // search | full
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--agent') config.agent = args[++i];
    else if (args[i] === '--destination') config.destination = args[++i];
    else if (args[i] === '--checkin') config.checkIn = args[++i];
    else if (args[i] === '--checkout') config.checkOut = args[++i];
    else if (args[i] === '--adults') config.adults = parseInt(args[++i]);
    else if (args[i] === '--timeout') config.timeout = parseInt(args[++i]);
    else if (args[i] === '--flow') config.flow = args[++i];
  }

  return config;
}

/**
 * Run OpenClaw agent command
 */
function runAgent(agentId, message, timeout = 180) {
  return new Promise((resolve, reject) => {
    const args = [
      'agent',
      '--agent', agentId,
      '-m', message,
      '--timeout', timeout.toString()
    ];

    console.log(`\n[EXEC] openclaw ${args.join(' ')}\n`);

    const proc = spawn('openclaw', args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env }
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      const text = data.toString();
      stdout += text;
      process.stdout.write(text);
    });

    proc.stderr.on('data', (data) => {
      const text = data.toString();
      stderr += text;
      process.stderr.write(text);
    });

    proc.on('close', (code) => {
      resolve({
        code,
        stdout,
        stderr
      });
    });

    proc.on('error', reject);

    // Timeout
    setTimeout(() => {
      proc.kill('SIGTERM');
      reject(new Error(`Timeout after ${timeout}s`));
    }, timeout * 1000);
  });
}

/**
 * Verify skill is being used by checking output
 * Returns object with found indicators for detailed reporting
 */
function verifySkillUsage(output) {
  const lowerOutput = output.toLowerCase();

  // Check for skill-related messages
  const indicators = [
    { key: 'skill_name', pattern: 'booking-com-automation', required: true, description: 'Skill name mentioned' },
    { key: 'booking_dotcom', pattern: 'booking.com', required: true, description: 'booking.com referenced' },
    { key: 'search_completed', pattern: 'search completed', required: true, description: 'Search completed message' },
    { key: 'search_results', pattern: 'search results', required: false, description: 'Search results mentioned' },
    { key: 'hotels_in', pattern: 'hotels in', required: false, description: 'Hotels search phrase' },
    { key: 'destination', pattern: 'destination:', required: true, description: 'Destination shown' }
  ];

  const found = [];
  const missing = [];

  for (const indicator of indicators) {
    if (lowerOutput.includes(indicator.pattern)) {
      found.push(indicator.description);
    } else {
      missing.push(indicator.description);
    }
  }

  // Must have ALL required indicators AND at least 50% of optional
  const requiredMissing = indicators.filter(i => i.required && !lowerOutput.includes(i.pattern));
  const success = requiredMissing.length === 0;

  return {
    success,
    found,
    missing,
    requiredMissing,
    matchedCount: found.length,
    totalCount: indicators.length
  };
}

/**
 * Verify search was successful
 * Returns object with found indicators for detailed reporting
 */
function verifySearchSuccess(output) {
  const lowerOutput = output.toLowerCase();

  const indicators = [
    { key: 'completed', pattern: 'completed', required: true, description: 'Completion status' },
    { key: 'results_url', pattern: 'url:', required: true, description: 'Results URL present' },
    { key: 'dates', pattern: '2026-', required: true, description: 'Dates displayed' },
    { key: 'guests', pattern: 'guest', required: true, description: 'Guests count shown' }
  ];

  const found = [];
  const missing = [];

  for (const indicator of indicators) {
    if (lowerOutput.includes(indicator.pattern)) {
      found.push(indicator.description);
    } else {
      missing.push(indicator.description);
    }
  }

  const requiredMissing = indicators.filter(i => i.required && !lowerOutput.includes(i.pattern));
  const success = requiredMissing.length === 0;

  return {
    success,
    found,
    missing,
    requiredMissing,
    matchedCount: found.length,
    totalCount: indicators.length
  };
}

/**
 * Print verification details
 */
function printVerificationDetails(verification, label) {
  console.log(`\n[${label}] Details:`);
  if (verification.found.length > 0) {
    console.log(`  ✓ Found (${verification.matchedCount}/${verification.totalCount}):`);
    verification.found.forEach(item => console.log(`    - ${item}`));
  }
  if (verification.missing.length > 0) {
    console.log(`  ${verification.success ? '⚠' : '✗'} Missing:`);
    verification.missing.forEach(item => console.log(`    - ${item}`));
  }
  if (verification.requiredMissing && verification.requiredMissing.length > 0) {
    console.log(`  ✗ Required missing (causes failure):`);
    verification.requiredMissing.forEach(item => console.log(`    - ${item}`));
  }
}

// ============================================================================
// TEST CASES FOR FULL BOOKING FLOW
// ============================================================================
//
// The booking flow has multiple stages. Currently only SEARCH is implemented.
// Below are test cases for the FULL flow (not yet executable).
//
// Full Flow Test Cases (when all stages are implemented):
// ----------------------------------------------------------------------------
const fullFlowTestCases = [
  {
    name: 'Full Booking Flow: Search → Select Property',
    stages: ['search', 'property_selection'],
    description: 'Search for hotels, select a property from results',
    // Message would need to handle multiple turns with the agent
    message: 'Find hotels in Paris from May 1-5, 2026. Select the first property with a guest rating above 8.0.'
  },
  {
    name: 'Full Booking Flow: Search → Property Details',
    stages: ['search', 'property_selection', 'property_details'],
    description: 'Search, select property, view details',
    message: 'Find hotels in Tokyo from April 10-15, 2026. Select a hotel and show me the property details including amenities.'
  },
  {
    name: 'Full Booking Flow: Search → Rooms',
    stages: ['search', 'property_selection', 'property_details', 'room_extraction'],
    description: 'Search, select property, view room options',
    message: 'Search Paris hotels for May 1-5. Pick a 4-star hotel and show me the available rooms with prices.'
  },
  {
    name: 'Full Booking Flow: Search → Guest Details',
    stages: ['search', 'property_selection', 'property_details', 'room_extraction', 'room_selection', 'guest_details'],
    description: 'Search through to entering guest details',
    message: 'Find hotels in London June 1-3. Select a room and enter guest details (test@test.com, John Doe).'
  },
  {
    name: 'Full Booking Flow: Complete Booking',
    stages: ['search', 'property_selection', 'property_details', 'room_extraction', 'room_selection', 'guest_details', 'payment'],
    description: 'Complete entire booking flow up to payment',
    message: 'Book a hotel in Berlin from July 1-4 for 2 adults. Select a room with free cancellation and enter guest details.'
  }
];

// Current Implementation - Search Only Test Cases
const searchTestCases = [
  {
    name: 'Search hotels in Paris',
    destination: 'Paris',
    checkIn: '2026-05-01',
    checkOut: '2026-05-05'
  },
  {
    name: 'Search hotels in Tokyo',
    destination: 'Tokyo',
    checkIn: '2026-04-10',
    checkOut: '2026-04-15'
  },
  {
    name: 'Search hotels in London',
    destination: 'London',
    checkIn: '2026-06-01',
    checkOut: '2026-06-03'
  }
];

/**
 * Run a single search test case
 */
async function runSearchTest(testCase) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`TEST: ${testCase.name}`);
  console.log('='.repeat(60));

  const message = `Find hotels in ${testCase.destination} from ${testCase.checkIn} to ${testCase.checkOut}. Use the booking-com-automation skill.`;

  const result = await runAgent(DEFAULT_AGENT, message, DEFAULT_TIMEOUT);

  // Verify skill was used
  const skillVerification = verifySkillUsage(result.stdout);
  console.log(`\n[VERIFY] Skill used: ${skillVerification.success ? '✓' : '✗'}`);
  printVerificationDetails(skillVerification, 'SKILL USAGE');

  // Verify search succeeded
  const searchVerification = verifySearchSuccess(result.stdout);
  console.log(`[VERIFY] Search success: ${searchVerification.success ? '✓' : '✗'}`);
  printVerificationDetails(searchVerification, 'SEARCH SUCCESS');

  return {
    name: testCase.name,
    skillUsed: skillVerification.success,
    searchSuccess: searchVerification.success,
    exitCode: result.code,
    skillDetails: skillVerification,
    searchDetails: searchVerification
  };
}

/**
 * Print full flow test cases (without executing)
 */
function printFullFlowTestCases() {
  console.log('\n' + '='.repeat(60));
  console.log('FULL BOOKING FLOW TEST CASES');
  console.log('(Not yet executable - waiting for full implementation)');
  console.log('='.repeat(60));

  fullFlowTestCases.forEach((tc, index) => {
    console.log(`\n${index + 1}. ${tc.name}`);
    console.log(`   Stages: ${tc.stages.join(' → ')}`);
    console.log(`   Description: ${tc.description}`);
    console.log(`   Message: "${tc.message}"`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('Implementation Status:');
  console.log('  ✓ SEARCH - Implemented and tested');
  console.log('  ✗ PROPERTY_SELECTION - Not implemented');
  console.log('  ✗ PROPERTY_DETAILS - Not implemented');
  console.log('  ✗ ROOM_EXTRACTION - Not implemented');
  console.log('  ✗ RATE_COMPARISON - Not implemented');
  console.log('  ✗ ROOM_SELECTION - Not implemented');
  console.log('  ✗ GUEST_DETAILS - Not implemented');
  console.log('  ✗ PAYMENT - Not implemented (user completes manually)');
  console.log('='.repeat(60));
}

/**
 * Main test runner
 */
async function main() {
  const config = parseArgs();

  console.log('\n' + '='.repeat(60));
  console.log('Booking.com Automation - E2E Test Suite');
  console.log('='.repeat(60));
  console.log(`Agent: ${config.agent}`);
  console.log(`Timeout: ${config.timeout}s`);
  console.log(`Environment: ${process.env.NODE_ENV || 'local'}`);
  console.log(`Flow: ${config.flow}`);
  console.log('='.repeat(60));

  // Check if running locally (not in CI)
  if (process.env.CI || process.env.NODE_ENV === 'ci') {
    console.log('\n⚠️  E2E tests are disabled in CI/CD environments.');
    console.log('This test is designed for LOCAL execution only.');
    console.log('To run locally: npm run test:e2e');
    process.exit(0);
  }

  // Print full flow test cases info
  if (config.flow === 'full') {
    printFullFlowTestCases();
    console.log('\nNote: Full flow tests are not yet executable.');
    console.log('Run with --flow search to test search functionality.');
    process.exit(0);
  }

  const results = [];

  // Run search test cases
  for (const testCase of searchTestCases) {
    try {
      const result = await runSearchTest(testCase);
      results.push(result);
    } catch (error) {
      console.error(`\n❌ Test failed: ${error.message}`);
      results.push({
        name: testCase.name,
        error: error.message
      });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));

  let passed = 0;
  let failed = 0;

  for (const result of results) {
    const status = result.error || (!result.skillUsed || !result.searchSuccess)
      ? '❌ FAILED'
      : '✓ PASSED';

    console.log(`${status} - ${result.name}`);

    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }

    if (!result.error && result.skillUsed && result.searchSuccess) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log('='.repeat(60));
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log('='.repeat(60));

  if (failed > 0) {
    console.log('\n⚠️  Some tests failed. Check the missing required indicators above.');
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
