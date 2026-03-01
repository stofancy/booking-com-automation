#!/usr/bin/env node

/**
 * Search Input Parser for booking.com
 * Parses natural language queries into structured search parameters
 * 
 * Examples:
 * - "Hotels in Paris, March 15-20, 2 guests"
 * - "Find a hotel in Tokyo next weekend for 2 adults and 1 child"
 * - "Cheap hotels in Barcelona, April 1-5, under $200/night"
 */

const fs = require('fs');
const path = require('path');

// Month name mappings
const MONTHS = {
  'january': 0, 'jan': 0,
  'february': 1, 'feb': 1,
  'march': 2, 'mar': 2,
  'april': 3, 'apr': 3,
  'may': 4,
  'june': 5, 'jun': 5,
  'july': 6, 'jul': 6,
  'august': 7, 'aug': 7,
  'september': 8, 'sep': 8, 'sept': 8,
  'october': 9, 'oct': 9,
  'november': 10, 'nov': 10,
  'december': 11, 'dec': 11
};

/**
 * Parse a natural language search query
 * @param {string} query - User's search query
 * @returns {Object} Parsed search parameters
 */
function parseSearchQuery(query) {
  const result = {
    destination: null,
    checkIn: null,
    checkOut: null,
    adults: 2,
    children: 0,
    rooms: 1,
    budget: null,
    flexible: false,
    flexibleDays: 0,
    raw: query
  };

  const normalized = query.toLowerCase();

  // Parse destination
  result.destination = parseDestination(normalized);

  // Parse dates
  const dates = parseDates(normalized);
  result.checkIn = dates.checkIn;
  result.checkOut = dates.checkOut;
  result.flexible = dates.flexible;
  result.flexibleDays = dates.flexibleDays;

  // Parse guests
  const guests = parseGuests(normalized);
  result.adults = guests.adults;
  result.children = guests.children;
  result.rooms = guests.rooms;

  // Parse budget
  result.budget = parseBudget(normalized);

  // Validate required fields
  result.valid = validateSearch(result);
  result.errors = getValidationErrors(result);

  return result;
}

/**
 * Parse destination from query
 */
function parseDestination(query) {
  // First, try to extract destination before date patterns
  // Remove date patterns from query first
  let cleanedQuery = query;
  
  // Remove ISO date patterns (2026-03-15)
  cleanedQuery = cleanedQuery.replace(/\d{4}-\d{1,2}-\d{1,2}(?:\s*[-–to]+\s*\d{4}-\d{1,2}-\d{1,2})?/gi, '');
  
  // Remove month date patterns (March 15-20, March 15 to 20)
  const monthNames = Object.keys(MONTHS).join('|');
  const monthDatePattern = new RegExp(`\\b(${monthNames})\\b\\s+\\d{1,2}(?:st|nd|rd|th)?(?:\\s*[-–to]+\\s*\\d{1,2}(?:st|nd|rd|th)?)?`, 'gi');
  cleanedQuery = cleanedQuery.replace(monthDatePattern, '');
  
  // Remove relative date patterns (next weekend, tomorrow, this weekend)
  cleanedQuery = cleanedQuery.replace(/\b(next weekend|this weekend|tomorrow|next week)\b/gi, '');
  
  // Now extract destination from cleaned query
  const patterns = [
    /(?:hotels?|accommodation|stay|places?)\s+(?:in|at|to|for)\s+([a-zA-Z\s,]+)/i,
    /(?:in|at|to)\s+([a-zA-Z\s,]+?)(?:,|$|for|from)/i,
    /^([a-zA-Z\s,]+?)(?:,|$|for|from)/i
  ];

  for (const pattern of patterns) {
    const match = cleanedQuery.match(pattern);
    if (match && match[1]) {
      let dest = match[1].trim();
      // Remove common stop words
      dest = dest.replace(/\b(hotels?|accommodation|stay|places?)\b/gi, '').trim();
      // Remove budget mentions
      dest = dest.replace(/\b(under|below|less than|cheap|budget)\b.*$/gi, '').trim();
      // Clean up trailing commas and words
      dest = dest.replace(/[,]+\s*$/, '').trim();
      dest = dest.replace(/\s+(and|to|for)\s*$/i, '').trim();
      // Remove any remaining trailing punctuation or prepositions
      dest = dest.replace(/[,;\s]+$/, '').trim();
      dest = dest.replace(/\s+for\s*$/, '').trim();
      
      if (dest.length > 0 && dest.length < 100) {
        return dest;
      }
    }
  }

  return null;
}

/**
 * Parse dates from query
 */
function parseDates(query) {
  const result = {
    checkIn: null,
    checkOut: null,
    flexible: false,
    flexibleDays: 0
  };

  // Check for flexible dates
  const flexibleMatch = query.match(/(?:flexible|±|\+\/-)\s*(\d+)\s*(?:days?|d)/i) || 
                         query.match(/(?:\+|-)(\d+)\s*(?:days?|d)/i);
  if (flexibleMatch) {
    result.flexible = true;
    result.flexibleDays = parseInt(flexibleMatch[1]);
  }

  // Try to parse absolute dates - ISO format FIRST (most specific)
  const datePatterns = [
    // 2026-03-15 to 2026-04-05 (ISO format) - MUST BE FIRST
    /(\d{4})-(\d{1,2})-(\d{1,2})\s+(?:to|-|–)\s+(\d{4})-(\d{1,2})-(\d{1,2})/i,
    // March 15-20, 2026
    /(\w+)\s+(\d{1,2})(?:st|nd|rd|th)?\s*[-–to]+\s*(\d{1,2})(?:st|nd|rd|th)?(?:,\s*(\d{4}))?/i,
    // March 15 to 20
    /(\w+)\s+(\d{1,2})(?:st|nd|rd|th)?\s+(?:to|through)\s+(\d{1,2})(?:st|nd|rd|th)?/i
  ];

  for (const pattern of datePatterns) {
    const match = query.match(pattern);
    if (match) {
      const dates = extractDatesFromMatch(match);
      if (dates.checkIn && dates.checkOut) {
        result.checkIn = dates.checkIn;
        result.checkOut = dates.checkOut;
        return result;
      }
    }
  }

  // Try relative dates (next weekend, tomorrow, etc.)
  const relativeDates = parseRelativeDates(query);
  if (relativeDates.checkIn && relativeDates.checkOut) {
    result.checkIn = relativeDates.checkIn;
    result.checkOut = relativeDates.checkOut;
  }

  return result;
}

/**
 * Extract dates from regex match
 */
function extractDatesFromMatch(match) {
  const now = new Date();
  let year = now.getFullYear();
  let checkIn, checkOut;

  // Check if this is ISO format (4-digit year followed by dash)
  // Pattern: YYYY-MM-DD to YYYY-MM-DD has 6 capture groups
  if (match.length === 7 && match[1] && match[4] && /^\d{4}$/.test(match[1]) && /^\d{4}$/.test(match[4])) {
    // ISO format: 2026-04-01 to 2026-04-05
    const year1 = parseInt(match[1]);
    const month1 = parseInt(match[2]) - 1;
    const day1 = parseInt(match[3]);
    const year2 = parseInt(match[4]);
    const month2 = parseInt(match[5]) - 1;
    const day2 = parseInt(match[6]);

    checkIn = new Date(year1, month1, day1);
    checkOut = new Date(year2, month2, day2);
  }
  // Month name format: March 15-20
  else if (match[1] && match[2] && match[3]) {
    const month = MONTHS[match[1].toLowerCase()];
    if (month !== undefined) {
      const day1 = parseInt(match[2]);
      const day2 = parseInt(match[3]);
      
      // Handle year if provided
      if (match[4]) {
        year = parseInt(match[4]);
      } else if (month < now.getMonth() || (month === now.getMonth() && day1 < now.getDate())) {
        year++; // Next year
      }

      checkIn = new Date(year, month, day1);
      checkOut = new Date(year, month, day2);
    }
  }

  return {
    checkIn: checkIn ? formatDate(checkIn) : null,
    checkOut: checkOut ? formatDate(checkOut) : null
  };
}

/**
 * Parse relative dates (next weekend, tomorrow, etc.)
 */
function parseRelativeDates(query) {
  const now = new Date();
  const result = { checkIn: null, checkOut: null };

  // Next weekend (Friday to Sunday)
  if (query.includes('next weekend')) {
    const nextWeekend = getNextWeekend(now);
    result.checkIn = formatDate(nextWeekend.friday);
    result.checkOut = formatDate(nextWeekend.sunday);
  }
  // This weekend
  else if (query.includes('this weekend')) {
    const thisWeekend = getThisWeekend(now);
    result.checkIn = formatDate(thisWeekend.friday);
    result.checkOut = formatDate(thisWeekend.sunday);
  }
  // Tomorrow
  else if (query.includes('tomorrow')) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);
    result.checkIn = formatDate(tomorrow);
    result.checkOut = formatDate(dayAfter);
  }
  // Next week
  else if (query.includes('next week')) {
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const weekLater = new Date(nextWeek);
    weekLater.setDate(weekLater.getDate() + 7);
    result.checkIn = formatDate(nextWeek);
    result.checkOut = formatDate(weekLater);
  }

  return result;
}

/**
 * Get this weekend dates
 */
function getThisWeekend(now) {
  const dayOfWeek = now.getDay();
  const friday = new Date(now);
  friday.setDate(friday.getDate() + (5 - dayOfWeek + 7) % 7);
  const sunday = new Date(friday);
  sunday.setDate(sunday.getDate() + 2);
  return { friday, sunday };
}

/**
 * Get next weekend dates
 */
function getNextWeekend(now) {
  const thisWeekend = getThisWeekend(now);
  const nextFriday = new Date(thisWeekend.friday);
  nextFriday.setDate(nextFriday.getDate() + 7);
  const nextSunday = new Date(thisWeekend.sunday);
  nextSunday.setDate(nextSunday.getDate() + 7);
  return { friday: nextFriday, sunday: nextSunday };
}

/**
 * Parse guest count from query
 */
function parseGuests(query) {
  const result = {
    adults: 2,
    children: 0,
    rooms: 1
  };

  // Parse adults
  const adultMatch = query.match(/(\d+)\s*(?:adults?|people|persons?|pax)/i);
  if (adultMatch) {
    result.adults = parseInt(adultMatch[1]);
  }

  // Parse children
  const childMatch = query.match(/(\d+)\s*(?:children|kids|child)/i);
  if (childMatch) {
    result.children = parseInt(childMatch[1]);
  }

  // Parse rooms
  const roomMatch = query.match(/(\d+)\s*(?:rooms?)/i);
  if (roomMatch) {
    result.rooms = parseInt(roomMatch[1]);
  }

  // Handle "2 guests" pattern
  const guestMatch = query.match(/(\d+)\s*(?:guests)/i);
  if (guestMatch && !adultMatch) {
    result.adults = parseInt(guestMatch[1]);
  }

  return result;
}

/**
 * Parse budget from query
 */
function parseBudget(query) {
  // Match patterns like "under $200", "below 200", "less than $200/night"
  const patterns = [
    /(?:under|below|less than|max|maximum|budget)\s*\$?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)(?:\s*\/?\s*(?:night|nt|per night))?/i,
    /\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:per night|\/night|\/nt)?/i
  ];

  for (const pattern of patterns) {
    const match = query.match(pattern);
    if (match) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      if (amount > 0 && amount < 100000) {
        return {
          amount: amount,
          period: 'night',
          currency: 'USD'
        };
      }
    }
  }

  // Handle "cheap" or "budget" without specific amount
  if (query.includes('cheap') || query.includes('budget')) {
    return {
      amount: 100,
      period: 'night',
      currency: 'USD',
      approximate: true
    };
  }

  return null;
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Validate search parameters
 */
function validateSearch(search) {
  return search.destination !== null && 
         search.checkIn !== null && 
         search.checkOut !== null &&
         search.adults > 0 &&
         search.rooms > 0;
}

/**
 * Get validation errors
 */
function getValidationErrors(search) {
  const errors = [];
  if (!search.destination) errors.push('Destination is required');
  if (!search.checkIn) errors.push('Check-in date is required');
  if (!search.checkOut) errors.push('Check-out date is required');
  if (search.checkIn && search.checkOut && new Date(search.checkIn) >= new Date(search.checkOut)) {
    errors.push('Check-out date must be after check-in date');
  }
  if (search.adults <= 0) errors.push('At least 1 adult is required');
  if (search.rooms <= 0) errors.push('At least 1 room is required');
  return errors;
}

/**
 * Format search parameters for display
 */
function formatSearchSummary(search) {
  const parts = [];
  if (search.destination) parts.push(`📍 ${search.destination}`);
  if (search.checkIn && search.checkOut) {
    parts.push(`📅 ${search.checkIn} to ${search.checkOut}`);
    if (search.flexible) {
      parts.push(`(±${search.flexibleDays} days)`);
    }
  }
  if (search.adults || search.children || search.rooms) {
    parts.push(`👥 ${search.adults} adult${search.adults !== 1 ? 's' : ''}`);
    if (search.children > 0) parts.push(`${search.children} child${search.children !== 1 ? 'ren' : ''}`);
    parts.push(`${search.rooms} room${search.rooms !== 1 ? 's' : ''}`);
  }
  if (search.budget) {
    parts.push(`💰 Under $${search.budget.amount}/night`);
  }
  return parts.join(' • ');
}

// Export for use in other modules
module.exports = {
  parseSearchQuery,
  parseDestination,
  parseDates,
  parseGuests,
  parseBudget,
  formatDate,
  formatSearchSummary,
  validateSearch,
  getValidationErrors
};

// CLI mode for testing
if (require.main === module) {
  const query = process.argv.slice(2).join(' ');
  if (!query) {
    console.log('Usage: node search-parser.js "<your search query>"');
    console.log('\nExamples:');
    console.log('  node search-parser.js "Hotels in Paris, March 15-20, 2 guests"');
    console.log('  node search-parser.js "Find a hotel in Tokyo next weekend"');
    console.log('  node search-parser.js "Cheap hotels in Barcelona, April 1-5, under $200/night"');
    process.exit(1);
  }

  console.log('Parsing query:', query);
  console.log('\n' + '='.repeat(60));
  
  const result = parseSearchQuery(query);
  
  console.log('\nParsed Result:');
  console.log(JSON.stringify(result, null, 2));
  
  console.log('\n' + '='.repeat(60));
  console.log('\nSummary:', formatSearchSummary(result));
  
  if (!result.valid) {
    console.log('\n⚠️  Validation Errors:');
    result.errors.forEach(err => console.log('  - ' + err));
  } else {
    console.log('\n✅ Valid search query');
  }
}
