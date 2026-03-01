#!/usr/bin/env node

/**
 * Decision Support for booking.com
 * Helps users make informed booking decisions with summaries, highlights, and recommendations
 * 
 * Usage:
 *   const { createDecisionSummary, highlightConcerns } = require('./decision-support.js');
 *   const summary = createDecisionSummary(propertyDetails);
 */

/**
 * Create a comprehensive decision summary for a property
 * @param {Object} property - Property details object
 * @returns {Object} Decision summary with highlights, concerns, and recommendation
 */
function createDecisionSummary(property) {
  try {
    const summary = {
      property: property.name || 'Unknown Property',
      overallScore: calculateOverallScore(property),
      keyFeatures: extractKeyFeatures(property),
      concerns: highlightConcerns(property),
      priceBreakdown: createPriceBreakdown(property),
      cancellationSummary: summarizeCancellation(property),
      recommendation: generateRecommendation(property),
      alternatives: suggestAlternatives(property),
      timestamp: new Date().toISOString()
    };
    
    return summary;
  } catch (error) {
    console.error('Error creating decision summary:', error.message);
    return {
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Calculate overall score based on multiple factors
 */
function calculateOverallScore(property) {
  let score = 0;
  let maxScore = 100;
  
  // Guest score (40 points max)
  if (property.guestScore) {
    score += (property.guestScore / 10) * 40;
  }
  
  // Star rating (20 points max)
  if (property.starRating) {
    score += (property.starRating / 5) * 20;
  }
  
  // Amenities (20 points max)
  if (property.amenities && property.amenities.length > 0) {
    const importantAmenities = ['Free WiFi', 'Breakfast included', 'Air conditioning', 'Parking'];
    const hasImportant = property.amenities.filter(a => importantAmenities.includes(a)).length;
    score += (hasImportant / importantAmenities.length) * 20;
  }
  
  // Location (20 points max)
  if (property.distanceFromCenter) {
    const distanceMatch = property.distanceFromCenter.match(/(\d+\.?\d*)/);
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
function extractKeyFeatures(property) {
  const features = [];
  
  // High guest score
  if (property.guestScore && property.guestScore >= 9.0) {
    features.push({
      type: 'positive',
      text: `Exceptional guest rating: ${property.guestScore}/10`,
      icon: '⭐'
    });
  } else if (property.guestScore && property.guestScore >= 8.0) {
    features.push({
      type: 'positive',
      text: `Very good guest rating: ${property.guestScore}/10`,
      icon: '⭐'
    });
  }
  
  // Star rating
  if (property.starRating && property.starRating >= 4) {
    features.push({
      type: 'positive',
      text: `${property.starRating}-star property`,
      icon: '🏨'
    });
  }
  
  // Important amenities
  const importantAmenities = {
    'Free WiFi': '📶',
    'Breakfast included': '🥐',
    'Free parking': '🅿️',
    'Pool': '🏊',
    'Gym': '💪',
    'Spa': '💆',
    'Air conditioning': '❄️'
  };
  
  if (property.amenities) {
    property.amenities.slice(0, 3).forEach(amenity => {
      const icon = importantAmenities[amenity] || '✓';
      features.push({
        type: 'positive',
        text: amenity,
        icon: icon
      });
    });
  }
  
  // Location
  if (property.distanceFromCenter) {
    const distanceMatch = property.distanceFromCenter.match(/(\d+\.?\d*)/);
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
  if (property.cancellationPolicy && property.cancellationPolicy.includes('Free cancellation')) {
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
function highlightConcerns(property) {
  const concerns = [];
  
  // Low guest score
  if (property.guestScore && property.guestScore < 7.0) {
    concerns.push({
      type: 'warning',
      text: `Low guest rating: ${property.guestScore}/10`,
      severity: 'high'
    });
  }
  
  // Few reviews
  if (property.reviewCount && property.reviewCount < 50) {
    concerns.push({
      type: 'warning',
      text: `Limited reviews (${property.reviewCount}) - less reliable rating`,
      severity: 'medium'
    });
  }
  
  // Missing important amenities
  const mustHaveAmenities = ['Free WiFi'];
  if (property.amenities) {
    mustHaveAmenities.forEach(amenity => {
      if (!property.amenities.includes(amenity)) {
        concerns.push({
          type: 'warning',
          text: `Missing: ${amenity}`,
          severity: 'medium'
        });
      }
    });
  }
  
  // Far from center
  if (property.distanceFromCenter) {
    const distanceMatch = property.distanceFromCenter.match(/(\d+\.?\d*)/);
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
  if (property.cancellationPolicy && property.cancellationPolicy.includes('Non-refundable')) {
    concerns.push({
      type: 'warning',
      text: 'Non-refundable rate - no cancellation allowed',
      severity: 'high'
    });
  }
  
  // Check for common concerns in description
  if (property.description) {
    const concernKeywords = {
      'no elevator': 'No elevator access',
      'shared bathroom': 'Shared bathroom facilities',
      'no air conditioning': 'No air conditioning',
      'street noise': 'Potential street noise',
      'renovation': 'Property under renovation'
    };
    
    const descLower = property.description.toLowerCase();
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
 * Create price breakdown
 */
function createPriceBreakdown(property) {
  const breakdown = {
    basePrice: null,
    taxes: null,
    fees: null,
    total: null,
    perNight: property.pricePerNight || null,
    currency: property.currency || 'USD'
  };
  
  // If we have total price, estimate breakdown
  if (property.totalPrice && property.pricePerNight) {
    breakdown.total = property.totalPrice;
    breakdown.basePrice = property.pricePerNight;
    
    // Estimate taxes and fees (typically 10-15%)
    const estimatedTaxes = Math.round(property.pricePerNight * 0.10);
    const estimatedFees = Math.round(property.pricePerNight * 0.05);
    
    breakdown.taxes = estimatedTaxes;
    breakdown.fees = estimatedFees;
  }
  
  return breakdown;
}

/**
 * Summarize cancellation policy
 */
function summarizeCancellation(property) {
  if (!property.cancellationPolicy) {
    return {
      type: 'unknown',
      text: 'Cancellation policy not specified',
      flexible: false
    };
  }
  
  const policy = property.cancellationPolicy.toLowerCase();
  
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
    text: property.cancellationPolicy,
    flexible: false
  };
}

/**
 * Generate recommendation
 */
function generateRecommendation(property) {
  const score = calculateOverallScore(property);
  const concerns = highlightConcerns(property);
  
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
 * Suggest alternatives to consider
 */
function suggestAlternatives(property) {
  const alternatives = [];
  
  // Suggest looking for properties with better ratings
  if (property.guestScore && property.guestScore < 8.5) {
    alternatives.push({
      type: 'better_rating',
      text: 'Consider properties with 8.5+ guest rating',
      priority: 'high'
    });
  }
  
  // Suggest looking for free cancellation
  if (property.cancellationPolicy && !property.cancellationPolicy.includes('Free cancellation')) {
    alternatives.push({
      type: 'flexible_cancellation',
      text: 'Look for properties with free cancellation',
      priority: 'medium'
    });
  }
  
  // Suggest looking for better location
  if (property.distanceFromCenter) {
    const distanceMatch = property.distanceFromCenter.match(/(\d+\.?\d*)/);
    if (distanceMatch && parseFloat(distanceMatch[1]) > 2) {
      alternatives.push({
        type: 'better_location',
        text: 'Consider properties closer to city center',
        priority: 'medium'
      });
    }
  }
  
  // Suggest looking for more amenities
  if (!property.amenities || property.amenities.length < 3) {
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

/**
 * Ask user for next action
 */
function askNextAction(summary) {
  const rec = summary.recommendation;
  
  if (rec && rec.action === 'book') {
    return {
      question: 'This property looks great! What would you like to do?',
      options: [
        '1. Book this property',
        '2. See more details',
        '3. Compare with other options',
        '4. Search different area'
      ]
    };
  }
  
  if (rec && rec.action === 'consider') {
    return {
      question: 'This property has some pros and cons. What would you like to do?',
      options: [
        '1. See more details',
        '2. Compare with similar properties',
        '3. Look for better options',
        '4. Search different area'
      ]
    };
  }
  
  return {
    question: 'This property may not be the best fit. What would you like to do?',
    options: [
      '1. See other recommendations',
      '2. Adjust search filters',
      '3. Search different area',
      '4. View all available options'
    ]
  };
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
  askNextAction
};

// CLI mode for testing
if (require.main === module) {
  console.log('Decision Support Module');
  console.log('\nUsage:');
  console.log('  const { createDecisionSummary, formatDecisionSummary } = require("./decision-support.js");');
  console.log('  const summary = createDecisionSummary(propertyDetails);');
  console.log('  console.log(formatDecisionSummary(summary));');
}
