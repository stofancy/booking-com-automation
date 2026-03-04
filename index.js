#!/usr/bin/env node

/**
 * Booking.com Automation Skill - Entry Point
 * 
 * A skill for automating hotel booking on booking.com from search to payment.
 * 
 * Usage:
 *   node index.js "Hotels in Paris, March 15-20, 2 guests"
 *   node index.js --help
 * 
 * Or use as a module:
 *   const { run } = require('./index.js');
 *   const result = await run({ query: "Hotels in Paris" });
 */

const path = require('path');

// Import scripts modules
const searchParser = require('./scripts/search-parser.js');
const searchForm = require('./scripts/search-form.js');
const resultsExtractor = require('./scripts/results-extractor.js');
const resultsPresenter = require('./scripts/results-presenter.js');
const propertySelector = require('./scripts/property-selector.js');
const propertyDetails = require('./scripts/property-details.js');
const decisionSupport = require('./scripts/decision-support.js');
const roomExtractor = require('./scripts/room-extractor.js');
const rateComparison = require('./scripts/rate-comparison.js');
const roomSelection = require('./scripts/room-selection.js');
const guestDetails = require('./scripts/guest-details.js');
const paymentHandoff = require('./scripts/payment-handoff.js');

const MODULE_NAME = 'booking-com-automation';
const VERSION = '1.0.0';

/**
 * Main run function - OpenClaw skill entry point
 * @param {Object} params - Parameters from OpenClaw
 * @param {string} params.query - Natural language search query
 * @param {Object} params.browser - Browser context (optional, for browser automation)
 * @param {Object} params.context - Additional context
 * @returns {Object} Standardized result object
 */
async function run(params) {
  const { query, browser, context = {} } = params;
  
  // Validate input
  if (!query) {
    return {
      success: false,
      error: 'Missing required parameter: query',
      message: 'Please provide a search query'
    };
  }
  
  try {
    // Step 1: Parse the search query
    const parsed = searchParser.parseSearchQuery(query);
    
    if (!parsed.valid) {
      return {
        success: false,
        error: 'Invalid query',
        message: searchParser.getValidationErrors(parsed).join(', '),
        data: { parsed, errors: searchParser.getValidationErrors(parsed) }
      };
    }
    
    // Step 2: Build search params for further processing
    const searchParams = {
      destination: parsed.destination,
      checkIn: parsed.dates?.checkIn,
      checkOut: parsed.dates?.checkOut,
      guests: parsed.guests,
      budget: parsed.budget,
      filters: parsed.filters
    };
    
    // If browser context provided, execute full flow
    if (browser) {
      return await executeFullFlow(browser, searchParams, context);
    }
    
    // Otherwise, return parsed data for verification
    return {
      success: true,
      message: 'Query parsed successfully. Browser context required for full execution.',
      data: {
        parsed: searchParams,
        summary: searchParser.formatSearchSummary(parsed),
        availableModules: [
          'search-form',
          'results-extractor', 
          'property-selector',
          'property-details',
          'room-extractor',
          'rate-comparison',
          'room-selection',
          'guest-details',
          'payment-handoff'
        ]
      }
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.name || 'Error',
      message: error.message,
      stack: error.stack
    };
  }
}

/**
 * Execute full booking flow with browser
 */
async function executeFullFlow(browser, searchParams, context) {
  try {
    // Execute search
    const searchResult = await searchForm.executeSearch(browser, searchParams);
    if (!searchResult.success) {
      return searchResult;
    }
    
    // Extract results
    const results = await resultsExtractor.extractResults(browser);
    
    // Present results
    const presentation = resultsPresenter.presentResults(results, searchParams);
    
    return {
      success: true,
      message: 'Search completed successfully',
      data: {
        searchParams,
        results: presentation,
        totalFound: results.length
      }
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.name || 'FlowError',
      message: error.message
    };
  }
}

/**
 * Get skill metadata
 */
function getMetadata() {
  return {
    name: MODULE_NAME,
    version: VERSION,
    description: 'Automate hotel booking on booking.com from search to payment',
    modules: {
      searchParser: Object.keys(searchParser),
      searchForm: Object.keys(searchForm).filter(k => typeof searchForm[k] === 'function'),
      resultsExtractor: Object.keys(resultsExtractor).filter(k => typeof resultsExtractor[k] === 'function'),
      resultsPresenter: Object.keys(resultsPresenter).filter(k => typeof resultsPresenter[k] === 'function'),
      propertySelector: Object.keys(propertySelector).filter(k => typeof propertySelector[k] === 'function'),
      propertyDetails: Object.keys(propertyDetails).filter(k => typeof propertyDetails[k] === 'function'),
      decisionSupport: Object.keys(decisionSupport).filter(k => typeof decisionSupport[k] === 'function'),
      roomExtractor: Object.keys(roomExtractor).filter(k => typeof roomExtractor[k] === 'function'),
      rateComparison: Object.keys(rateComparison).filter(k => typeof rateComparison[k] === 'function'),
      roomSelection: Object.keys(roomSelection).filter(k => typeof roomSelection[k] === 'function'),
      guestDetails: Object.keys(guestDetails).filter(k => typeof guestDetails[k] === 'function'),
      paymentHandoff: Object.keys(paymentHandoff).filter(k => typeof paymentHandoff[k] === 'function')
    }
  };
}

/**
 * CLI mode
 */
function cli() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
Booking.com Automation Skill v${VERSION}

Usage:
  node index.js "<search query>"
  node index.js --metadata
  node index.js --help

Examples:
  node index.js "Hotels in Paris, March 15-20, 2 guests"
  node index.js "Find a hotel in Tokyo next weekend"
  node index.js "Cheap hotels in Barcelona, April 1-5, under $200/night"

As a module:
  const { run } = require('./index.js');
  const result = await run({ query: "Hotels in Paris" });
`);
    return;
  }
  
  if (args[0] === '--metadata' || args[0] === '-m') {
    console.log(JSON.stringify(getMetadata(), null, 2));
    return;
  }
  
  const query = args.join(' ');
  
  console.log('Processing query:', query);
  console.log('='.repeat(60));
  
  run({ query }).then(result => {
    console.log('\nResult:');
    console.log(JSON.stringify(result, null, 2));
    
    if (!result.success) {
      process.exit(1);
    }
  }).catch(error => {
    console.error('Error:', error.message);
    process.exit(1);
  });
}

// Export for OpenClaw
module.exports = {
  run,
  getMetadata,
  // Also export individual modules for direct access
  searchParser,
  searchForm,
  resultsExtractor,
  resultsPresenter,
  propertySelector,
  propertyDetails,
  decisionSupport,
  roomExtractor,
  rateComparison,
  roomSelection,
  guestDetails,
  paymentHandoff
};

// CLI entry point
if (require.main === module) {
  cli();
}