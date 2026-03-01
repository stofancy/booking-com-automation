#!/usr/bin/env node

/**
 * Results Presenter for booking.com
 * Presents hotel search results to users in a clear, actionable format
 * 
 * Usage:
 *   const { presentResults, highlightBestValue } = require('./results-presenter.js');
 *   const presentation = await presentResults(results, { top: 5 });
 */

const { sortResults, filterResults, getRatingCategory, findBestValue } = require('./results-extractor.js');

/**
 * Present search results to user
 * @param {Array} results - Array of hotel result objects
 * @param {Object} options - Presentation options
 * @returns {Promise<Object>} Presentation object with formatted output
 */
async function presentResults(results, options = {}) {
  try {
    const topN = options.top || 5;
    const sortBy = options.sortBy || 'bestValue';
    const filters = options.filters || {};
    
    console.log('📊 Presenting search results...');
    
    // Handle no results
    if (!results || results.length === 0) {
      return handleNoResults(options.searchParams);
    }
    
    // Apply filters
    let filtered = filterResults(results, filters);
    
    // Handle no results after filtering
    if (filtered.length === 0) {
      return handleNoResultsAfterFilter(filters, options.searchParams);
    }
    
    // Sort results
    const sorted = sortResults(filtered, sortBy);
    
    // Get top N results
    const topResults = sorted.slice(0, topN);
    
    // Find best value hotel
    const bestValue = findBestValue(sorted);
    
    // Format results
    const formattedResults = topResults.map((hotel, index) => {
      return formatHotelCard(hotel, index + 1, hotel === bestValue);
    });
    
    // Create summary
    const summary = createSummary(sorted, filters, options.searchParams);
    
    // Create refinement options
    const refinementOptions = createRefinementOptions(filters, options.searchParams);
    
    const presentation = {
      success: true,
      count: topResults.length,
      totalAvailable: sorted.length,
      summary: summary,
      results: formattedResults,
      bestValueIndex: sorted.indexOf(bestValue) + 1,
      refinementOptions: refinementOptions,
      timestamp: new Date().toISOString()
    };
    
    console.log(`✅ Presented ${presentation.count} of ${presentation.totalAvailable} hotels`);
    return presentation;
    
  } catch (error) {
    console.error('❌ Error presenting results:', error.message);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Format a single hotel result card
 */
function formatHotelCard(hotel, index, isBestValue = false) {
  const lines = [];
  
  // Header with index and best value badge
  let header = `${index}. ${hotel.name || 'Unknown Hotel'}`;
  if (isBestValue) {
    header += ' 🏆 BEST VALUE';
  }
  lines.push(header);
  
  // Rating
  if (hotel.rating) {
    const category = getRatingCategory(hotel.rating);
    const stars = getStarRating(hotel.rating);
    lines.push(`   ${stars} ${hotel.rating}/10 ${category}`);
  }
  
  // Price
  if (hotel.pricePerNight) {
    lines.push(`   💰 $${hotel.pricePerNight}/night`);
    if (hotel.totalPrice) {
      lines.push(`   💵 Total: $${hotel.totalPrice}`);
    }
  }
  
  // Location
  if (hotel.location) {
    lines.push(`   📍 ${hotel.location}`);
  }
  if (hotel.distance) {
    lines.push(`   🚶 ${hotel.distance} from center`);
  }
  
  // Amenities (top 3)
  if (hotel.amenities && hotel.amenities.length > 0) {
    const topAmenities = hotel.amenities.slice(0, 3);
    lines.push(`   🏨 ${topAmenities.join(' • ')}`);
  }
  
  // Special badges
  if (hotel.genius) {
    lines.push(`   🎯 Genius discount available`);
  }
  if (hotel.freeCancellation) {
    lines.push(`   ✅ Free cancellation`);
  }
  if (hotel.breakfastIncluded) {
    lines.push(`   🥐 Breakfast included`);
  }
  
  // Booking link
  if (hotel.bookingUrl) {
    lines.push(`   🔗 ${hotel.bookingUrl}`);
  }
  
  return lines.join('\n');
}

/**
 * Get star rating text based on score
 */
function getStarRating(score) {
  if (score >= 9.0) return '⭐⭐⭐⭐⭐';
  if (score >= 8.0) return '⭐⭐⭐⭐';
  if (score >= 7.0) return '⭐⭐⭐';
  if (score >= 6.0) return '⭐⭐';
  return '⭐';
}

/**
 * Create summary of search results
 */
function createSummary(results, filters, searchParams) {
  const lines = [];
  
  // Total results
  lines.push(`📊 Found ${results.length} hotels`);
  
  // Search params summary
  if (searchParams) {
    const parts = [];
    if (searchParams.destination) parts.push(searchParams.destination);
    if (searchParams.checkIn && searchParams.checkOut) {
      parts.push(`${searchParams.checkIn} to ${searchParams.checkOut}`);
    }
    if (searchParams.adults) parts.push(`${searchParams.adults} guests`);
    if (parts.length > 0) {
      lines.push(`🔍 Search: ${parts.join(' • ')}`);
    }
  }
  
  // Applied filters
  const appliedFilters = [];
  if (filters.maxPrice) appliedFilters.push(`under $${filters.maxPrice}`);
  if (filters.minRating) appliedFilters.push(`${filters.minRating}+ rating`);
  if (filters.geniusOnly) appliedFilters.push('Genius only');
  if (filters.freeCancellation) appliedFilters.push('Free cancellation');
  
  if (appliedFilters.length > 0) {
    lines.push(`🎯 Filters: ${appliedFilters.join(' • ')}`);
  }
  
  // Price range
  const prices = results.filter(h => h.pricePerNight).map(h => h.pricePerNight);
  if (prices.length > 0) {
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    lines.push(`💰 Price range: $${minPrice} - $${maxPrice}/night`);
  }
  
  // Rating range
  const ratings = results.filter(h => h.rating).map(h => h.rating);
  if (ratings.length > 0) {
    const minRating = Math.min(...ratings);
    const maxRating = Math.max(...ratings);
    lines.push(`⭐ Rating range: ${minRating} - ${maxRating}`);
  }
  
  return lines.join('\n');
}

/**
 * Create refinement options for user
 */
function createRefinementOptions(filters, searchParams) {
  const options = [];
  
  // Suggest price filter if not applied
  if (!filters.maxPrice) {
    options.push({
      type: 'filter',
      action: 'setMaxPrice',
      label: 'Filter by price',
      suggestion: 'Try filtering by max price (e.g., under $200/night)'
    });
  }
  
  // Suggest rating filter if not applied
  if (!filters.minRating) {
    options.push({
      type: 'filter',
      action: 'setMinRating',
      label: 'Filter by rating',
      suggestion: 'Try filtering by minimum rating (e.g., 8.0+)'
    });
  }
  
  // Suggest sorting options
  options.push(
    {
      type: 'sort',
      action: 'sortByPrice',
      label: 'Sort by price',
      suggestion: 'Sort by price (lowest first)'
    },
    {
      type: 'sort',
      action: 'sortByRating',
      label: 'Sort by rating',
      suggestion: 'Sort by rating (highest first)'
    },
    {
      type: 'sort',
      action: 'sortByBestValue',
      label: 'Sort by best value',
      suggestion: 'Sort by best value (rating/price ratio)'
    }
  );
  
  // Suggest date flexibility if not already flexible
  if (searchParams && !searchParams.flexible) {
    options.push({
      type: 'modify',
      action: 'addFlexibleDates',
      label: 'Try flexible dates',
      suggestion: 'Enable flexible dates (±3 days) for more options'
    });
  }
  
  return options;
}

/**
 * Handle no results scenario
 */
function handleNoResults(searchParams) {
  const message = {
    success: true,
    count: 0,
    summary: '❌ No hotels found',
    results: [],
    suggestions: [],
    timestamp: new Date().toISOString()
  };
  
  // Provide suggestions
  if (searchParams) {
    if (searchParams.destination) {
      message.suggestions.push(`Try searching for nearby areas or a broader region`);
    }
    if (searchParams.checkIn && searchParams.checkOut) {
      message.suggestions.push(`Try different dates or enable flexible dates`);
    }
    message.suggestions.push(`Check your spelling and try again`);
    message.suggestions.push(`Consider expanding your search radius`);
  }
  
  message.summary += '\n\n💡 Suggestions:\n' + 
    message.suggestions.map(s => `  • ${s}`).join('\n');
  
  console.log('⚠️  No results found - provided suggestions');
  return message;
}

/**
 * Handle no results after filtering
 */
function handleNoResultsAfterFilter(filters, searchParams) {
  const message = {
    success: true,
    count: 0,
    summary: '❌ No hotels match your filters',
    results: [],
    suggestions: [],
    timestamp: new Date().toISOString()
  };
  
  // Suggest relaxing filters
  if (filters.maxPrice) {
    message.suggestions.push(`Increase your budget (currently under $${filters.maxPrice})`);
  }
  if (filters.minRating) {
    message.suggestions.push(`Lower your minimum rating requirement (currently ${filters.minRating}+)`);
  }
  if (filters.geniusOnly) {
    message.suggestions.push(`Remove "Genius only" filter to see more options`);
  }
  if (filters.freeCancellation) {
    message.suggestions.push(`Remove "Free cancellation" filter to see more options`);
  }
  
  message.summary += '\n\n💡 Try relaxing these filters:\n' + 
    message.suggestions.map(s => `  • ${s}`).join('\n');
  
  console.log('⚠️  No results after filtering - suggested relaxing filters');
  return message;
}

/**
 * Highlight best value option
 */
function highlightBestValue(results) {
  if (!results || results.length === 0) {
    return null;
  }
  
  const bestValue = findBestValue(results);
  if (!bestValue) {
    return null;
  }
  
  return {
    hotel: bestValue,
    reason: `Best value: ${bestValue.rating}/10 rating at $${bestValue.pricePerNight}/night`,
    valueScore: (bestValue.rating || 5) / (bestValue.pricePerNight || 100)
  };
}

/**
 * Present comparison of top hotels
 */
function presentComparison(results, topN = 3) {
  if (!results || results.length === 0) {
    return { error: 'No results to compare' };
  }
  
  const sorted = sortResults(results, 'bestValue');
  const topHotels = sorted.slice(0, topN);
  
  const comparison = {
    hotels: topHotels.map((h, i) => ({
      rank: i + 1,
      name: h.name,
      rating: h.rating,
      price: h.pricePerNight,
      valueScore: (h.rating || 5) / (h.pricePerNight || 100)
    })),
    summary: `Comparing top ${topHotels.length} hotels by value`
  };
  
  return comparison;
}

/**
 * Ask user for next action
 */
function askNextAction(presentation) {
  const options = [
    '1. Book this hotel',
    '2. See more hotels',
    '3. Change filters',
    '4. Change dates',
    '5. Search different location',
    '6. Start over'
  ];
  
  return {
    question: 'What would you like to do next?',
    options: options,
    defaultAction: 'wait'
  };
}

// Export for use in other modules
module.exports = {
  presentResults,
  formatHotelCard,
  getStarRating,
  createSummary,
  createRefinementOptions,
  handleNoResults,
  handleNoResultsAfterFilter,
  highlightBestValue,
  presentComparison,
  askNextAction
};

// CLI mode for testing
if (require.main === module) {
  console.log('Results Presenter Module');
  console.log('\nUsage:');
  console.log('  const { presentResults } = require("./results-presenter.js");');
  console.log('  const presentation = await presentResults(results, { top: 5 });');
  console.log('  console.log(presentation.summary);');
  console.log('  presentation.results.forEach(r => console.log(r));');
}
