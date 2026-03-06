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
    timeout: DEFAULT_TIMEOUT
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--agent') config.agent = args[++i];
    else if (args[i] === '--destination') config.destination = args[++i];
    else if (args[i] === '--checkin') config.checkIn = args[++i];
    else if (args[i] === '--checkout') config.checkOut = args[++i];
    else if (args[i] === '--adults') config.adults = parseInt(args[++i]);
    else if (args[i] === '--timeout') config.timeout = parseInt(args[++i]);
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
    { key: 'skill_name', pattern: 'booking-com-automation', description: 'Skill name mentioned' },
    { key: 'booking_dotcom', pattern: 'booking.com', description: 'booking.com referenced' },
    { key: 'search_completed', pattern: 'search completed', description: 'Search completed message' },
    { key: 'search_results', pattern: 'search results', description: 'Search results mentioned' },
    { key: 'hotels_in', pattern: 'hotels in', description: 'Hotels search phrase' },
    { key: 'destination', pattern: 'destination:', description: 'Destination shown' }
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

  const success = found.length >= 2; // At least 2 indicators must match

  return {
    success,
    found,
    missing,
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
    { key: 'completed', pattern: 'completed', description: 'Completion status' },
    { key: 'results_url', pattern: 'url:', description: 'Results URL present' },
    { key: 'dates', pattern: '2026-', description: 'Dates displayed' },
    { key: 'guests', pattern: 'guest', description: 'Guests count shown' }
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

  const success = found.length >= 2;

  return {
    success,
    found,
    missing,
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
  if (verification.missing.length > 0 && !verification.success) {
    console.log(`  ✗ Missing:`);
    verification.missing.forEach(item => console.log(`    - ${item}`));
  }
}

// Test cases
const testCases = [
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
 * Run a single test case
 */
async function runTest(testCase) {
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
  console.log('='.repeat(60));

  // Check if running locally (not in CI)
  if (process.env.CI || process.env.NODE_ENV === 'ci') {
    console.log('\n⚠️  E2E tests are disabled in CI/CD environments.');
    console.log('This test is designed for LOCAL execution only.');
    console.log('To run locally: npm run test:e2e');
    process.exit(0);
  }

  const results = [];

  // Run test cases
  for (const testCase of testCases) {
    try {
      const result = await runTest(testCase);
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

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
