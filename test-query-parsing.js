#!/usr/bin/env node

/**
 * Test query parsing to understand the date format issue
 */

const { searchParser } = require('./index.js');

// Test the exact query we're using
const query = "Hotels in Tokyo, March 15-20, 2 guests";
console.log('Testing query:', query);

const parsed = searchParser.parseSearchQuery(query);
console.log('Parsed result:', JSON.stringify(parsed, null, 2));

if (parsed.valid) {
  console.log('\n✅ Query parsing successful!');
  console.log('Destination:', parsed.destination);
  console.log('Dates:', parsed.dates);
  console.log('Guests:', parsed.guests);
} else {
  console.log('\n❌ Query parsing failed!');
  console.log('Errors:', searchParser.getValidationErrors(parsed));
}