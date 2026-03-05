#!/usr/bin/env node

/**
 * Results Extractor for booking.com
 * Extracts hotel search results from booking.com pages using browser-based DOM extraction
 *
 * Usage:
 *   const { extractResults, formatResults } = require('./results-extractor.js');
 *   const results = await extractResults(browser);
 */

/**
 * Extract all hotel results from search results page
 * @param {Object} page - Playwright page object
 * @param {Object} options - Extraction options
 * @param {number} options.maxResults - Maximum number of results to extract (default: 10)
 * @returns {Promise<Array>} Array of hotel result objects
 */
async function extractResults(page, options = {}) {
  try {
    console.log('Extracting search results...');

    const maxResults = options.maxResults || 10;
    const results = [];

    // Extract hotel data using Playwright's evaluate
    const hotelCards = await page.evaluate(() => {
      const cards = [];
      // Find property cards - look for hotel links in search results
      // Hotel links typically have href containing '/hotel/'
      const links = Array.from(document.querySelectorAll('a'));
      const hotelLinks = links.filter(a => 
        a.href && 
        a.href.includes('/hotel/') && 
        a.textContent && 
        a.textContent.trim().length > 10 &&
        !a.textContent.includes('Genius') &&
        !a.textContent.includes('Sign in')
      );
      
      hotelLinks.forEach((el, index) => {
        try {
          // Extract hotel name
          const nameEl = el.querySelector('[data-testid="title"]') || el.querySelector('.b9780ed57c a') || el.querySelector('h3');
          const name = nameEl?.textContent?.trim() || null;
          
          if (!name) return;
          
          // Extract rating
          const ratingEl = el.querySelector('[data-testid="review-score"]') || el.querySelector('.b9780ed57c [class*="review"]');
          const ratingText = ratingEl?.textContent?.trim() || '';
          const rating = ratingText.match(/(\d+\.?\d*)/)?.[1] || null;
          
          // Extract review count
          const reviewText = ratingEl?.textContent?.trim() || '';
          const reviews = reviewText.match(/(\d[\d,]*)\s*reviews?/)?.[1] || null;
          
          // Extract price
          const priceEl = el.querySelector('[data-testid="price-and-discounted-price"]') || el.querySelector('.b9780ed57c [class*="price"]');
          const price = priceEl?.textContent?.trim() || null;
          
          // Extract location
          const locationEl = el.querySelector('[data-testid="location"]') || el.querySelector('.b9780ed57c [class*="location"]');
          const location = locationEl?.textContent?.trim() || null;
          
          // Extract URL
          const linkEl = el.querySelector('a');
          const url = linkEl?.href || null;
          
          // Check for badges
          const geniusBadge = el.textContent.includes('Genius');
          const freeCancel = el.textContent.includes('Free cancellation');
          const breakfast = el.textContent.includes('Breakfast');
          
          cards.push({
            name,
            rating,
            reviews,
            price,
            location,
            url,
            genius: geniusBadge,
            freeCancellation: freeCancel,
            breakfastIncluded: breakfast
          });
        } catch (e) {
          // Skip malformed cards
        }
      });
      
      return cards;
    });

    console.log(`Found ${hotelCards.length} hotel cards`);

    // Transform to expected format
    for (let i = 0; i < Math.min(hotelCards.length, maxResults); i++) {
      const card = hotelCards[i];
      results.push({
        index: i + 1,
        name: card.name,
        rating: card.rating,
        reviews: card.reviews ? `${card.reviews} reviews` : null,
        price: card.price,
        location: card.location,
        url: card.url,
        genius: card.genius,
        freeCancellation: card.freeCancellation,
        breakfastIncluded: card.breakfastIncluded
      });
    }

    console.log(`Extracted ${results.length} hotels`);
    return results;

  } catch (error) {
    console.error('Error extracting results:', error.message);
    throw error;
  }
}

/**
 * Parse hotel cards from browser snapshot
 * The snapshot contains ARIA tree structure with region "Search results"
 * containing property cards as child elements
 *
 * @param {Object} snapshot - Browser snapshot object
 * @returns {Array} Array of hotel card objects
 */
function parseHotelCardsFromSnapshot(snapshot) {
  const cards = [];

  // Snapshot structure:
  // region "Search results"
  //   - generic (property cards)
  //     - link (hotel card)
  //       - heading (hotel name)
  //       - generic (rating/score)
  //       - generic (price info)

  if (!snapshot.elements || !Array.isArray(snapshot.elements)) {
    console.warn('⚠️  No elements found in snapshot');
    return cards;
  }

  // Find the search results region
  const searchResultsRegion = findElementByRoleAndName(snapshot.elements, 'region', 'Search results');

  if (!searchResultsRegion) {
    console.warn('⚠️  Search results region not found, scanning all elements');
    // Fallback: scan all elements for hotel cards
    return extractCardsFromElements(snapshot.elements);
  }

  // Extract cards from the search results region
  if (searchResultsRegion.children) {
    return extractCardsFromElements(searchResultsRegion.children);
  }

  return cards;
}

/**
 * Find element by role and optional name
 * @param {Array} elements - Array of elements to search
 * @param {string} role - ARIA role to match
 * @param {string} name - Optional name/label to match
 * @returns {Object|null} Matching element or null
 */
function findElementByRoleAndName(elements, role, name = null) {
  for (const element of elements) {
    if (element.role === role) {
      if (!name || (element.name && element.name.includes(name))) {
        return element;
      }
    }

    if (element.children) {
      const found = findElementByRoleAndName(element.children, role, name);
      if (found) return found;
    }
  }

  return null;
}

/**
 * Extract hotel cards from an array of elements
 * Looks for link elements that contain hotel information
 * @param {Array} elements - Array of elements
 * @returns {Array} Array of hotel card objects
 */
function extractCardsFromElements(elements) {
  const cards = [];

  for (const element of elements) {
    // Hotel cards are typically links
    if (element.role === 'link') {
      const card = extractCardFromLink(element);
      if (card) {
        cards.push(card);
      }
    }

    // Recursively search children
    if (element.children) {
      const childCards = extractCardsFromElements(element.children);
      cards.push(...childCards);
    }
  }

  return cards;
}

/**
 * Extract hotel card data from a link element
 * @param {Object} linkElement - Link element representing a hotel card
 * @returns {Object|null} Hotel card data or null if invalid
 */
function extractCardFromLink(linkElement) {
  const card = {
    url: linkElement.url || linkElement.href || null,
    name: null,
    rating: null,
    reviews: null,
    price: null,
    originalPrice: null,
    location: null,
    image: null,
    badges: []
  };

  // Extract from children
  if (linkElement.children) {
    for (const child of linkElement.children) {
      extractCardChildData(child, card);
    }
  }

  // Only return valid cards with at least a name
  if (!card.name) {
    return null;
  }

  return card;
}

/**
 * Extract data from card child elements recursively
 * @param {Object} element - Child element
 * @param {Object} card - Card object to populate
 */
function extractCardChildData(element, card) {
  // Hotel name - usually in a heading
  if (element.role === 'heading' && !card.name) {
    card.name = element.name || element.text || element.value || null;
  }

  // Rating - often in generic elements with numeric values
  if (element.role === 'generic' || element.role === 'text') {
    const text = element.name || element.text || element.value || '';

    // Rating pattern: "8.5", "9.2", etc.
    const ratingMatch = text.match(/(\d\.\d)/);
    if (ratingMatch && !card.rating) {
      const rating = parseFloat(ratingMatch[1]);
      if (rating >= 1 && rating <= 10) {
        card.rating = rating.toString();
      }
    }

    // Review count pattern: "1,234 reviews", "(567)"
    const reviewMatch = text.match(/(\d[\d,]*)\s*reviews?/i) ||
                        text.match(/\((\d[\d,]*)\s*reviews?\)/i);
    if (reviewMatch && !card.reviews) {
      card.reviews = reviewMatch[1];
    }

    // Price patterns
    // Current price: "CNY 1,234", "$123", "€100"
    const priceMatch = text.match(/([A-Z]{3}|[$€£])\s*([\d,]+)/);
    if (priceMatch && !card.price) {
      card.price = `${priceMatch[1]} ${priceMatch[2]}`;
    }

    // Original/strikethrough price (often marked with special formatting)
    if ((element.strikethrough || text.includes('~~') || element.class?.includes('strikethrough'))
        && !card.originalPrice) {
      const origPriceMatch = text.match(/([A-Z]{3}|[$€£])?\s*([\d,]+)/);
      if (origPriceMatch) {
        card.originalPrice = `${origPriceMatch[1] || ''} ${origPriceMatch[2]}`.trim();
      }
    }

    // Location
    if ((text.includes('km from') || text.includes('miles from') ||
         text.includes('Center') || text.includes('Downtown')) && !card.location) {
      card.location = text;
    }

    // Badges
    if (text.includes('Genius') || text.includes('genius')) {
      card.badges.push('Genius');
    }
    if (text.includes('Free cancellation') || text.includes('free cancellation')) {
      card.badges.push('Free cancellation');
    }
    if (text.includes('Breakfast included') || text.includes('breakfast included')) {
      card.badges.push('Breakfast included');
    }
  }

  // Image URL
  if (element.role === 'img' && !card.image) {
    card.image = element.src || element.url || element['data-src'] || null;
  }

  // Recurse into children
  if (element.children) {
    for (const child of element.children) {
      extractCardChildData(child, card);
    }
  }
}

/**
 * Extract structured hotel data from a parsed card
 * @param {Object} card - Parsed card object
 * @param {number} index - Hotel index
 * @returns {Object} Structured hotel data
 */
function extractHotelData(card, index) {
  return {
    index: index + 1,
    name: card.name || null,
    rating: card.rating || null,
    reviews: card.reviews ? `${card.reviews} reviews` : null,
    price: card.price || null,
    originalPrice: card.originalPrice || null,
    location: card.location || null,
    url: card.url || null,
    image: card.image || null,
    genius: card.badges.includes('Genius'),
    freeCancellation: card.badges.includes('Free cancellation'),
    breakfastIncluded: card.badges.includes('Breakfast included')
  };
}

/**
 * Sort results by specified criteria
 * @param {Array} results - Array of hotel results
 * @param {string} criteria - Sort criteria: 'bestValue', 'price', 'rating'
 * @returns {Array} Sorted results
 */
function sortResults(results, criteria = 'bestValue') {
  const sorted = [...results];

  switch (criteria) {
    case 'price':
      sorted.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
      break;
    case 'rating':
      sorted.sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0));
      break;
    case 'bestValue':
    default:
      // Best value = rating / price ratio
      sorted.sort((a, b) => {
        const valueA = calculateValueScore(a);
        const valueB = calculateValueScore(b);
        return valueB - valueA;
      });
      break;
  }

  return sorted;
}

/**
 * Parse price string to numeric value
 * @param {string} priceStr - Price string like "CNY 1,234" or "$123"
 * @returns {number} Numeric price value
 */
function parsePrice(priceStr) {
  if (!priceStr) return Infinity;
  const match = priceStr.match(/[\d,]+/);
  return match ? parseFloat(match[0].replace(/,/g, '')) : Infinity;
}

/**
 * Calculate value score for best value sorting
 * @param {Object} hotel - Hotel object
 * @returns {number} Value score
 */
function calculateValueScore(hotel) {
  const rating = parseFloat(hotel.rating || 5);
  const price = parsePrice(hotel.price) || 100;
  return rating / price;
}

/**
 * Filter results by criteria
 * @param {Array} results - Array of hotel results
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered results
 */
function filterResults(results, filters = {}) {
  let filtered = [...results];

  if (filters.maxPrice) {
    filtered = filtered.filter(h => parsePrice(h.price) <= filters.maxPrice);
  }

  if (filters.minRating) {
    filtered = filtered.filter(h => parseFloat(h.rating || 0) >= filters.minRating);
  }

  if (filters.geniusOnly) {
    filtered = filtered.filter(h => h.genius);
  }

  if (filters.freeCancellation) {
    filtered = filtered.filter(h => h.freeCancellation);
  }

  if (filters.breakfastIncluded) {
    filtered = filtered.filter(h => h.breakfastIncluded);
  }

  return filtered;
}

/**
 * Format results for display
 * @param {Array} results - Array of hotel results
 * @param {Object} options - Formatting options
 * @param {number} options.top - Number of top results to show (default: 5)
 * @param {string} options.sortBy - Sort criteria (default: 'bestValue')
 * @returns {string} Formatted results string
 */
function formatResults(results, options = {}) {
  const topN = options.top || 5;
  const sortBy = options.sortBy || 'bestValue';

  if (!results || results.length === 0) {
    return '🏨 No hotels found.';
  }

  // Sort and limit results
  const sorted = sortResults(results, sortBy);
  const topResults = sorted.slice(0, topN);

  // Format each result
  const formatted = topResults.map((hotel, index) => {
    const lines = [
      `${index + 1}. ${hotel.name || 'Unknown Hotel'}`
    ];

    if (hotel.rating) {
      const category = getRatingCategory(parseFloat(hotel.rating));
      lines.push(`   ⭐ ${hotel.rating}/10 ${category}`);
    }

    if (hotel.price) {
      lines.push(`   💰 ${hotel.price}${hotel.originalPrice ? ` (was ${hotel.originalPrice})` : ''}`);
    }

    if (hotel.location) {
      lines.push(`   📍 ${hotel.location}`);
    }

    if (hotel.reviews) {
      lines.push(`   📝 ${hotel.reviews}`);
    }

    if (hotel.genius) {
      lines.push(`   🎯 Genius discount available`);
    }

    if (hotel.freeCancellation) {
      lines.push(`   ✅ Free cancellation`);
    }

    if (hotel.breakfastIncluded) {
      lines.push(`   🍳 Breakfast included`);
    }

    if (hotel.url) {
      lines.push(`   🔗 ${hotel.url}`);
    }

    return lines.join('\n');
  });

  return formatted.join('\n\n');
}

/**
 * Get rating category text
 * @param {number} score - Rating score
 * @returns {string} Category text
 */
function getRatingCategory(score) {
  if (score >= 9.0) return 'Exceptional';
  if (score >= 8.0) return 'Very Good';
  if (score >= 7.0) return 'Good';
  if (score >= 6.0) return 'Pleasant';
  return 'Okay';
}

/**
 * Find best value hotel
 * @param {Array} results - Array of hotel results
 * @returns {Object|null} Best value hotel or null
 */
function findBestValue(results) {
  if (!results || results.length === 0) {
    return null;
  }

  const sorted = sortResults(results, 'bestValue');
  return sorted[0];
}

/**
 * Find cheapest hotel
 * @param {Array} results - Array of hotel results
 * @returns {Object|null} Cheapest hotel or null
 */
function findCheapest(results) {
  if (!results || results.length === 0) {
    return null;
  }

  const sorted = sortResults(results, 'price');
  return sorted[0];
}

/**
 * Find highest rated hotel
 * @param {Array} results - Array of hotel results
 * @returns {Object|null} Highest rated hotel or null
 */
function findHighestRated(results) {
  if (!results || results.length === 0) {
    return null;
  }

  const sorted = sortResults(results, 'rating');
  return sorted[0];
}

// Export for use in other modules
module.exports = {
  extractResults,
  sortResults,
  filterResults,
  formatResults,
  getRatingCategory,
  findBestValue,
  findCheapest,
  findHighestRated
};

// CLI mode for testing
if (require.main === module) {
  console.log('Results Extractor Module');
  console.log('This module requires browser automation to be configured.');
  console.log('\nUsage:');
  console.log('  const { extractResults, formatResults } = require("./results-extractor.js");');
  console.log('  const results = await extractResults(browser);');
  console.log('  console.log(formatResults(results, { top: 5 }));');
}
