#!/usr/bin/env node

/**
 * Rate Comparison for booking.com
 * Compares room rates and helps users choose the best option
 * 
 * Usage:
 *   const { compareRates, formatRateComparison } = require('./rate-comparison.js');
 *   const comparison = compareRates(rooms);
 */

/**
 * Compare rates across all rooms and find best options
 * @param {Array} rooms - Array of room objects with rates
 * @returns {Object} Rate comparison result
 */
function compareRates(rooms) {
  if (!rooms || rooms.length === 0) {
    return {
      cheapest: null,
      bestValue: null,
      mostFlexible: null,
      allRates: [],
      recommendation: null
    };
  }
  
  const allRates = [];
  
  // Collect all rates from all rooms
  rooms.forEach(room => {
    if (room.rates && room.rates.length > 0) {
      room.rates.forEach(rate => {
        allRates.push({
          roomName: room.name,
          roomIndex: room.index,
          rate: rate,
          valueScore: calculateValueScore(room, rate)
        });
      });
    }
  });
  
  if (allRates.length === 0) {
    return {
      cheapest: null,
      bestValue: null,
      mostFlexible: null,
      allRates: [],
      recommendation: null
    };
  }
  
  // Find cheapest rate
  const cheapest = allRates.reduce((min, item) => 
    item.rate.perNight < min.rate.perNight ? item : min, allRates[0]);
  
  // Find best value (amenities + flexibility / price)
  const bestValue = allRates.reduce((best, item) => 
    item.valueScore > best.valueScore ? item : best, allRates[0]);
  
  // Find most flexible (free cancellation)
  const flexibleRates = allRates.filter(item => 
    item.rate.freeCancellation || item.rate.refundable);
  const mostFlexible = flexibleRates.length > 0 ? 
    flexibleRates.reduce((min, item) => 
      item.rate.perNight < min.rate.perNight ? item : min, flexibleRates[0]) : null;
  
  // Generate recommendation
  const recommendation = generateRateRecommendation(cheapest, bestValue, mostFlexible);
  
  return {
    cheapest,
    bestValue,
    mostFlexible,
    allRates,
    recommendation
  };
}

/**
 * Calculate value score for a rate
 */
function calculateValueScore(room, rate) {
  let score = 0;
  
  // Base score from amenities
  if (room.amenities) {
    score += room.amenities.length * 2;
  }
  
  // Bonus for important amenities
  const importantAmenities = ['Free WiFi', 'Breakfast included', 'Air conditioning'];
  if (room.amenities) {
    importantAmenities.forEach(amenity => {
      if (room.amenities.includes(amenity)) {
        score += 5;
      }
    });
  }
  
  // Bonus for refundable
  if (rate.refundable) {
    score += 10;
  }
  
  // Bonus for free cancellation
  if (rate.freeCancellation) {
    score += 8;
  }
  
  // Bonus for breakfast
  if (rate.breakfastIncluded) {
    score += 6;
  }
  
  // Divide by price to get value score
  return score / (rate.perNight || 1);
}

/**
 * Generate recommendation based on comparison
 */
function generateRateRecommendation(cheapest, bestValue, mostFlexible) {
  if (!cheapest && !bestValue) {
    return {
      type: 'none',
      text: 'No rates available for comparison'
    };
  }
  
  // If best value is same as cheapest, recommend it
  if (bestValue && cheapest && 
      bestValue.roomName === cheapest.roomName && 
      bestValue.rate.perNight === cheapest.rate.perNight) {
    return {
      type: 'best_value',
      text: `Best value: ${bestValue.roomName} at $${bestValue.rate.perNight}/night`,
      confidence: 'high',
      reasons: [
        'Lowest price available',
        'Good amenities for the price',
        bestValue.rate.refundable ? 'Free cancellation available' : null
      ].filter(Boolean)
    };
  }
  
  // If most flexible is reasonably priced, recommend it
  if (mostFlexible && mostFlexible.rate.perNight <= cheapest.rate.perNight * 1.2) {
    return {
      type: 'flexible',
      text: `Recommended: ${mostFlexible.roomName} with free cancellation`,
      confidence: 'high',
      reasons: [
        `Only $${(mostFlexible.rate.perNight - cheapest.rate.perNight).toFixed(0)} more than cheapest`,
        'Free cancellation for peace of mind',
        'More flexible booking terms'
      ]
    };
  }
  
  // Otherwise recommend best value
  if (bestValue) {
    return {
      type: 'best_value',
      text: `Best value: ${bestValue.roomName} at $${bestValue.rate.perNight}/night`,
      confidence: 'medium',
      reasons: [
        'Best balance of price and features',
        bestValue.rate.breakfastIncluded ? 'Breakfast included' : null,
        bestValue.rate.refundable ? 'Refundable rate' : null
      ].filter(Boolean)
    };
  }
  
  // Fall back to cheapest
  return {
    type: 'cheapest',
    text: `Cheapest option: ${cheapest.roomName} at $${cheapest.rate.perNight}/night`,
    confidence: 'low',
    reasons: [
      'Lowest price available',
      'Good for budget-conscious travelers'
    ]
  };
}

/**
 * Format rate comparison for display
 */
function formatRateComparison(comparison, options = {}) {
  const lines = [];
  
  // Recommendation
  if (comparison.recommendation) {
    const icon = comparison.recommendation.type === 'best_value' ? '⭐' :
                 comparison.recommendation.type === 'flexible' ? '✅' : '💰';
    lines.push(`${icon} ${comparison.recommendation.text}`);
    lines.push('');
  }
  
  // Cheapest option
  if (comparison.cheapest) {
    lines.push(`💰 Cheapest: ${comparison.cheapest.roomName}`);
    lines.push(`   $${comparison.cheapest.rate.perNight}/night`);
    if (comparison.cheapest.rate.refundable) {
      lines.push('   ✅ Refundable');
    }
    lines.push('');
  }
  
  // Best value option
  if (comparison.bestValue && comparison.bestValue !== comparison.cheapest) {
    lines.push(`⭐ Best Value: ${comparison.bestValue.roomName}`);
    lines.push(`   $${comparison.bestValue.rate.perNight}/night`);
    if (comparison.bestValue.rate.breakfastIncluded) {
      lines.push('   🥐 Breakfast included');
    }
    if (comparison.bestValue.rate.freeCancellation) {
      lines.push('   ✅ Free cancellation');
    }
    lines.push('');
  }
  
  // Most flexible option
  if (comparison.mostFlexible && comparison.mostFlexible !== comparison.cheapest) {
    lines.push(`✅ Most Flexible: ${comparison.mostFlexible.roomName}`);
    lines.push(`   $${comparison.mostFlexible.rate.perNight}/night`);
    lines.push('   ✅ Free cancellation');
    lines.push('');
  }
  
  // All rates summary
  if (options.showAll && comparison.allRates && comparison.allRates.length > 0) {
    lines.push('📊 All Options:');
    comparison.allRates.forEach((item, index) => {
      lines.push(`   ${index + 1}. ${item.roomName} - $${item.rate.perNight}/night`);
    });
    lines.push('');
  }
  
  return lines.join('\n');
}

/**
 * Create side-by-side rate comparison table
 */
function createRateTable(rooms) {
  const table = {
    headers: ['Room', 'Price/Night', 'Total', 'Refundable', 'Breakfast', 'Cancellation'],
    rows: []
  };
  
  rooms.forEach(room => {
    if (room.rates && room.rates.length > 0) {
      room.rates.forEach(rate => {
        table.rows.push([
          room.name,
          `$${rate.perNight}`,
          `$${rate.total || rate.perNight * 3}`,
          rate.refundable ? '✅' : '❌',
          rate.breakfastIncluded ? '✅' : '❌',
          rate.freeCancellation ? 'Free' : 'Non-refundable'
        ]);
      });
    }
  });
  
  return table;
}

/**
 * Format rate table for display
 */
function formatRateTable(table) {
  // Calculate column widths
  const widths = table.headers.map((header, i) => {
    const maxWidth = Math.max(
      header.length,
      ...table.rows.map(row => (row[i] || '').length)
    );
    return maxWidth + 2;
  });
  
  // Format header
  const lines = [];
  lines.push('┌' + widths.map(w => '─'.repeat(w)).join('┬') + '┐');
  lines.push('│' + table.headers.map((h, i) => h.padEnd(widths[i])).join('│') + '│');
  lines.push('├' + widths.map(w => '─'.repeat(w)).join('┼') + '┤');
  
  // Format rows
  table.rows.forEach(row => {
    lines.push('│' + row.map((cell, i) => (cell || '').padEnd(widths[i])).join('│') + '│');
  });
  
  lines.push('└' + widths.map(w => '─'.repeat(w)).join('┴') + '┘');
  
  return lines.join('\n');
}

/**
 * Highlight differences between rates
 */
function highlightRateDifferences(rooms) {
  const differences = {
    priceRange: { min: Infinity, max: 0 },
    refundableCount: 0,
    breakfastCount: 0,
    freeCancellationCount: 0
  };
  
  rooms.forEach(room => {
    if (room.rates && room.rates.length > 0) {
      room.rates.forEach(rate => {
        differences.priceRange.min = Math.min(differences.priceRange.min, rate.perNight);
        differences.priceRange.max = Math.max(differences.priceRange.max, rate.perNight);
        
        if (rate.refundable) differences.refundableCount++;
        if (rate.breakfastIncluded) differences.breakfastCount++;
        if (rate.freeCancellation) differences.freeCancellationCount++;
      });
    }
  });
  
  differences.priceRange.diff = differences.priceRange.max - differences.priceRange.min;
  
  return differences;
}

// Export for use in other modules
module.exports = {
  compareRates,
  calculateValueScore,
  generateRateRecommendation,
  formatRateComparison,
  createRateTable,
  formatRateTable,
  highlightRateDifferences
};

// CLI mode for testing
if (require.main === module) {
  console.log('Rate Comparison Module');
  console.log('\nUsage:');
  console.log('  const { compareRates, formatRateComparison } = require("./rate-comparison.js");');
  console.log('  const comparison = compareRates(rooms);');
  console.log('  console.log(formatRateComparison(comparison));');
}
