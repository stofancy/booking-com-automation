#!/usr/bin/env node

/**
 * Decision Support for booking.com
 * Analyzes property data and provides recommendations to users
 * 
 * Usage:
 *   const { createDecisionSummary, formatDecisionSummary } = require('./decision-support.js');
 *   const summary = createDecisionSummary(propertyDetails, roomOptions);
 * 
 * Depends on: property-details.js (Story 4.2)
 */

const { extractPropertyDetails } = require('./property-details.js');

/**
 * Create comprehensive decision summary
 * @param {Object} propertyDetails - Property data from Story 4.2
 * @param {Array} roomOptions - Room options from room extraction
 * @returns {Object} Decision summary
 */
function createDecisionSummary(propertyDetails, roomOptions = []) {
  const summary = {
    property: propertyDetails.name || 'Unknown Property',
    overallScore: calculateOverallScore(propertyDetails),
    keyFeatures: extractKeyFeatures(propertyDetails),
    concerns: highlightConcerns(propertyDetails),
    priceBreakdown: createPriceBreakdown(roomOptions),
    cancellationSummary: summarizeCancellation(propertyDetails),
    recommendation: generateRecommendation(propertyDetails, roomOptions),
    alternatives: suggestAlternatives(propertyDetails, roomOptions),
    timestamp: new Date().toISOString()
  };
  
  return summary;
}

/**
 * Calculate overall property score (0-100)
 */
function calculateOverallScore(propertyDetails) {
  let score = 0;
  const maxScore = 100;
  
  // Guest score (40 points max)
  if (propertyDetails.guestScore) {
    score += (propertyDetails.guestScore / 10) * 40;
  }
  
  // Star rating (20 points max)
  if (propertyDetails.starRating) {
    score += (propertyDetails.starRating / 5) * 20;
  }
  
  // Amenities (20 points max)
  if (propertyDetails.amenities && propertyDetails.amenities.length > 0) {
    const importantAmenities = ['Free Wifi', 'Breakfast included', 'Air conditioning', 'Parking'];
    const hasImportant = propertyDetails.amenities.filter(a => 
      importantAmenities.some(imp => a.toLowerCase().includes(imp.toLowerCase()))
    ).length;
    score += (hasImportant / importantAmenities.length) * 20;
  }
  
  // Location (20 points max)
  if (propertyDetails.distanceFromCenter) {
    const distanceMatch = propertyDetails.distanceFromCenter.match(/(\d+\.?\d*)/);
    if (distanceMatch) {
      const distance = parseFloat(distanceMatch[1]);
      if (distance <= 1) score += 20;  // Within 1km
      else if (distance <= 2) score += 15;  // Within 2km
      else if (distance <= 5) score += 10;  // Within 5km
      else score += 5;  // Far from center
    }
  }
  
  return {
    score: Math.round(score),
    maxScore: maxScore,
    rating: getScoreRating(score)
  };
}

/**
 * Get score rating text
 */
function getScoreRating(score) {
  if (score >= 90) return 'Excellent Choice';
  if (score >= 75) return 'Very Good';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Poor';
}

/**
 * Extract key features (top 3-5 highlights)
 */
function extractKeyFeatures(propertyDetails) {
  const features = [];
  
  // High guest score
  if (propertyDetails.guestScore && propertyDetails.guestScore >= 9.0) {
    features.push({
      type: 'positive',
      text: `Exceptional guest rating: ${propertyDetails.guestScore}/10`,
      icon: '⭐'
    });
  } else if (propertyDetails.guestScore && propertyDetails.guestScore >= 8.0) {
    features.push({
      type: 'positive',
      text: `Very good guest rating: ${propertyDetails.guestScore}/10`,
      icon: '⭐'
    });
  }
  
  // Star rating
  if (propertyDetails.starRating && propertyDetails.starRating >= 4) {
    features.push({
      type: 'positive',
      text: `${propertyDetails.starRating}-star property`,
      icon: '🏨'
    });
  }
  
  // Important amenities
  const importantAmenities = {
    'Free Wifi': '📶',
    'Breakfast included': '🥐',
    'Free parking': '🅿️',
    'Pool': '🏊',
    'Gym': '💪',
    'Spa': '💆',
    'Air conditioning': '❄️'
  };
  
  if (propertyDetails.amenities) {
    propertyDetails.amenities.slice(0, 3).forEach(amenity => {
      const icon = importantAmenities[amenity] || '✓';
      features.push({
        type: 'positive',
        text: amenity,
        icon: icon
      });
    });
  }
  
  // Location
  if (propertyDetails.distanceFromCenter) {
    const distanceMatch = propertyDetails.distanceFromCenter.match(/(\d+\.?\d*)/);
    if (distanceMatch) {
      const distance = parseFloat(distanceMatch[1]);
      if (distance <= 1) {
        features.push({
          type: 'positive',
          text: 'Excellent location - walking distance to center',
          icon: '📍'
        });
      } else if (distance <= 2) {
        features.push({
          type: 'positive',
          text: 'Great location - close to center',
          icon: '📍'
        });
      }
    }
  }
  
  // Free cancellation
  if (propertyDetails.cancellationPolicy && propertyDetails.cancellationPolicy.includes('Free cancellation')) {
    features.push({
      type: 'positive',
      text: 'Free cancellation available',
      icon: '✅'
    });
  }
  
  return features.slice(0, 5); // Top 5 features
}

/**
 * Highlight potential concerns
 */
function highlightConcerns(propertyDetails) {
  const concerns = [];
  
  // Low guest score
  if (propertyDetails.guestScore && propertyDetails.guestScore < 7.0) {
    concerns.push({
      type: 'warning',
      text: `Low guest rating: ${propertyDetails.guestScore}/10`,
      severity: 'high'
    });
  }
  
  // Few reviews
  if (propertyDetails.reviewCount && propertyDetails.reviewCount < 50) {
    concerns.push({
      type: 'warning',
      text: `Limited reviews (${propertyDetails.reviewCount}) - less reliable rating`,
      severity: 'medium'
    });
  }
  
  // Missing important amenities
  const mustHaveAmenities = ['Free Wifi'];
  if (propertyDetails.amenities) {
    mustHaveAmenities.forEach(amenity => {
      if (!propertyDetails.amenities.some(a => a.toLowerCase().includes(amenity.toLowerCase()))) {
        concerns.push({
          type: 'warning',
          text: `Missing: ${amenity}`,
          severity: 'medium'
        });
      }
    });
  }
  
  // Far from center
  if (propertyDetails.distanceFromCenter) {
    const distanceMatch = propertyDetails.distanceFromCenter.match(/(\d+\.?\d*)/);
    if (distanceMatch) {
      const distance = parseFloat(distanceMatch[1]);
      if (distance > 5) {
        concerns.push({
          type: 'warning',
          text: `Far from city center (${distance}km)`,
          severity: 'low'
        });
      }
    }
  }
  
  // Strict cancellation
  if (propertyDetails.cancellationPolicy && propertyDetails.cancellationPolicy.includes('Non-refundable')) {
    concerns.push({
      type: 'warning',
      text: 'Non-refundable rate - no cancellation allowed',
      severity: 'high'
    });
  }
  
  // Check for common concerns in description
  if (propertyDetails.description) {
    const concernKeywords = {
      'no elevator': 'No elevator access',
      'shared bathroom': 'Shared bathroom facilities',
      'no air conditioning': 'No air conditioning',
      'street noise': 'Potential street noise',
      'renovation': 'Property under renovation'
    };
    
    const descLower = propertyDetails.description.toLowerCase();
    Object.keys(concernKeywords).forEach(keyword => {
      if (descLower.includes(keyword)) {
        concerns.push({
          type: 'warning',
          text: concernKeywords[keyword],
          severity: 'medium'
        });
      }
    });
  }
  
  return concerns;
}

/**
 * Create price breakdown from room options or property
 */
function createPriceBreakdown(roomOptions) {
  // Handle null/undefined
  if (!roomOptions) {
    return {
      basePrice: null,
      taxes: null,
      fees: null,
      total: null,
      perNight: null,
      currency: 'USD'
    };
  }
  
  // Handle single property object (for tests)
  if (roomOptions.pricePerNight && !Array.isArray(roomOptions)) {
    const perNight = roomOptions.pricePerNight;
    const total = roomOptions.totalPrice || null;
    
    return {
      basePrice: perNight,
      taxes: Math.round(perNight * 0.10),
      fees: Math.round(perNight * 0.05),
      total: total || Math.round(perNight * 1.15),
      perNight: perNight,
      currency: roomOptions.currency || 'USD'
    };
  }
  
  // Handle single room object (not array)
  if (!Array.isArray(roomOptions)) {
    roomOptions = [roomOptions];
  }
  
  if (roomOptions.length === 0) {
    return {
      basePrice: null,
      taxes: null,
      fees: null,
      total: null,
      perNight: null,
      currency: 'USD'
    };
  }
  
  // Find lowest price room
  const prices = roomOptions
    .filter(r => r && r.pricePerNight)
    .map(r => r.pricePerNight);
  
  const lowestPrice = prices.length > 0 ? Math.min(...prices) : null;
  
  if (lowestPrice) {
    return {
      basePrice: lowestPrice,
      taxes: Math.round(lowestPrice * 0.10), // Estimate 10% taxes
      fees: Math.round(lowestPrice * 0.05),  // Estimate 5% fees
      total: Math.round(lowestPrice * 1.15),
      perNight: lowestPrice,
      currency: 'USD'
    };
  }
  
  return {
    basePrice: null,
    taxes: null,
    fees: null,
    total: null,
    perNight: null,
    currency: 'USD'
  };
}

/**
 * Summarize cancellation policy
 */
function summarizeCancellation(propertyDetails) {
  if (!propertyDetails.cancellationPolicy) {
    return {
      type: 'unknown',
      text: 'Cancellation policy not specified',
      flexible: false
    };
  }
  
  const policy = propertyDetails.cancellationPolicy.toLowerCase();
  
  if (policy.includes('free cancellation')) {
    if (policy.includes('until')) {
      const dateMatch = policy.match(/until ([^\n]+)/i);
      return {
        type: 'flexible',
        text: `Free cancellation until ${dateMatch ? dateMatch[1].trim() : 'specified date'}`,
        flexible: true
      };
    }
    return {
      type: 'flexible',
      text: 'Free cancellation available',
      flexible: true
    };
  }
  
  if (policy.includes('non-refundable')) {
    return {
      type: 'strict',
      text: 'Non-refundable - no cancellation allowed',
      flexible: false
    };
  }
  
  if (policy.includes('free cancellation before')) {
    const beforeMatch = policy.match(/before ([^\n]+)/i);
    return {
      type: 'flexible',
      text: `Free cancellation before ${beforeMatch ? beforeMatch[1].trim() : 'specified date'}`,
      flexible: true
    };
  }
  
  return {
    type: 'moderate',
    text: propertyDetails.cancellationPolicy,
    flexible: false
  };
}

/**
 * Generate recommendation based on property data
 */
function generateRecommendation(propertyDetails, roomOptions) {
  const score = calculateOverallScore(propertyDetails);
  const concerns = highlightConcerns(propertyDetails);
  
  // Count high severity concerns
  const highSeverityConcerns = concerns.filter(c => c.severity === 'high').length;
  
  if (score.score >= 80 && highSeverityConcerns === 0) {
    return {
      action: 'book',
      confidence: 'high',
      text: 'Highly recommended - excellent choice!',
      reasons: [
        `Overall score: ${score.score}/100 (${score.rating})`,
        'No major concerns identified',
        'Good value for money'
      ]
    };
  }
  
  if (score.score >= 60 && highSeverityConcerns <= 1) {
    return {
      action: 'consider',
      confidence: 'medium',
      text: 'Good option - worth considering',
      reasons: [
        `Overall score: ${score.score}/100 (${score.rating})`,
        highSeverityConcerns === 1 ? '1 concern to consider' : 'Minor concerns only',
        'Compare with alternatives before booking'
      ]
    };
  }
  
  return {
    action: 'compare',
    confidence: 'low',
    text: 'Consider other options',
    reasons: [
      `Overall score: ${score.score}/100 (${score.rating})`,
      highSeverityConcerns > 0 ? `${highSeverityConcerns} significant concern(s)` : 'Better options may be available',
      'Recommend comparing with other properties'
    ]
  };
}

/**
 * Suggest alternatives based on property weaknesses
 */
function suggestAlternatives(propertyDetails, roomOptions) {
  const alternatives = [];
  
  // Suggest looking for properties with better ratings
  if (propertyDetails.guestScore && propertyDetails.guestScore < 8.5) {
    alternatives.push({
      type: 'better_rating',
      text: 'Consider properties with 8.5+ guest rating',
      priority: 'high'
    });
  }
  
  // Suggest looking for free cancellation
  if (propertyDetails.cancellationPolicy && !propertyDetails.cancellationPolicy.includes('Free cancellation')) {
    alternatives.push({
      type: 'flexible_cancellation',
      text: 'Look for properties with free cancellation',
      priority: 'medium'
    });
  }
  
  // Suggest looking for better location
  if (propertyDetails.distanceFromCenter) {
    const distanceMatch = propertyDetails.distanceFromCenter.match(/(\d+\.?\d*)/);
    if (distanceMatch && parseFloat(distanceMatch[1]) > 2) {
      alternatives.push({
        type: 'better_location',
        text: 'Consider properties closer to city center',
        priority: 'medium'
      });
    }
  }
  
  // Suggest looking for more amenities
  if (!propertyDetails.amenities || propertyDetails.amenities.length < 3) {
    alternatives.push({
      type: 'more_amenities',
      text: 'Look for properties with more amenities',
      priority: 'low'
    });
  }
  
  return alternatives;
}

/**
 * Format decision summary for display
 */
function formatDecisionSummary(summary) {
  const lines = [];
  
  // Header
  lines.push(`🏨 ${summary.property}`);
  lines.push(`Overall Score: ${summary.overallScore.score}/100 - ${summary.overallScore.rating}`);
  lines.push('');
  
  // Key Features
  if (summary.keyFeatures && summary.keyFeatures.length > 0) {
    lines.push('✨ Key Features:');
    summary.keyFeatures.forEach(f => {
      lines.push(`  ${f.icon} ${f.text}`);
    });
    lines.push('');
  }
  
  // Concerns
  if (summary.concerns && summary.concerns.length > 0) {
    lines.push('⚠️  Concerns:');
    summary.concerns.forEach(c => {
      const icon = c.severity === 'high' ? '🔴' : c.severity === 'medium' ? '🟡' : '🟢';
      lines.push(`  ${icon} ${c.text}`);
    });
    lines.push('');
  }
  
  // Cancellation
  if (summary.cancellationSummary) {
    const cancelIcon = summary.cancellationSummary.flexible ? '✅' : '❌';
    lines.push(`${cancelIcon} Cancellation: ${summary.cancellationSummary.text}`);
    lines.push('');
  }
  
  // Recommendation
  if (summary.recommendation) {
    const recIcon = summary.recommendation.action === 'book' ? '✅' : 
                    summary.recommendation.action === 'consider' ? '🤔' : '🔍';
    lines.push(`${recIcon} Recommendation: ${summary.recommendation.text}`);
    lines.push(`   Confidence: ${summary.recommendation.confidence}`);
    lines.push('');
  }
  
  return lines.join('\n');
}

// Export for use in other modules
module.exports = {
  createDecisionSummary,
  calculateOverallScore,
  extractKeyFeatures,
  highlightConcerns,
  createPriceBreakdown,
  summarizeCancellation,
  generateRecommendation,
  suggestAlternatives,
  formatDecisionSummary,
  getScoreRating,
  askNextAction
};

/**
 * Ask user for next action based on recommendation
 */
function askNextAction(recommendation) {
  if (!recommendation) {
    return {
      question: 'What would you like to do?',
      options: [
        '1. See more details',
        '2. Compare with other properties',
        '3. Search different area',
        '4. Start over'
      ],
      defaultAction: 'wait'
    };
  }
  
  if (recommendation.action === 'book') {
    return {
      question: 'This property looks great! What would you like to do?',
      options: [
        '1. Book this property',
        '2. See more details',
        '3. Compare with other options',
        '4. Search different location'
      ],
      defaultAction: 'book'
    };
  }
  
  if (recommendation.action === 'consider') {
    return {
      question: 'This property has some pros and cons. What would you like to do?',
      options: [
        '1. See more details',
        '2. Compare with similar properties',
        '3. Look for better options',
        '4. Search different area'
      ],
      defaultAction: 'consider'
    };
  }
  
  // recommendation.action === 'compare'
  return {
    question: 'This property may not be the best fit. What would you like to do?',
    options: [
      '1. See other recommendations',
      '2. Adjust search filters',
      '3. Search different area',
      '4. View all available options'
    ],
    defaultAction: 'compare'
  };
}

// CLI mode for testing
if (require.main === module) {
  console.log('Decision Support Module');
  console.log('\nUsage:');
  console.log('  const { createDecisionSummary, formatDecisionSummary } = require("./decision-support.js");');
  console.log('  const summary = createDecisionSummary(propertyDetails, roomOptions);');
  console.log('  console.log(formatDecisionSummary(summary));');
}
