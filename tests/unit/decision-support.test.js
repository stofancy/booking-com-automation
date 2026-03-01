/**
 * Unit Tests for Decision Support
 * Tests the decision-support.js module
 * 
 * Run: npm test
 */

const assert = require('assert');
const { describe, it } = require('node:test');

// Import module
const decisionSupport = require('../../scripts/decision-support.js');

describe('Decision Support', () => {
  
  describe('calculateOverallScore', () => {
    it('should calculate score for excellent property', () => {
      const property = {
        guestScore: 9.5,
        starRating: 5,
        amenities: ['Free WiFi', 'Breakfast included', 'Air conditioning', 'Pool', 'Gym'],
        distanceFromCenter: '0.5km from center'
      };
      
      const score = decisionSupport.calculateOverallScore(property);
      
      assert.ok(score.score > 0);
      assert.ok(score.score <= 100);
      assert.ok(score.rating);
    });
    
    it('should calculate score for good property', () => {
      const property = {
        guestScore: 8.0,
        starRating: 3,
        amenities: ['Free WiFi', 'Parking'],
        distanceFromCenter: '2km from center'
      };
      
      const score = decisionSupport.calculateOverallScore(property);
      
      assert.ok(score.score > 0);
      assert.ok(score.score <= 100);
    });
    
    it('should handle minimal property info', () => {
      const property = {
        name: 'Simple Hotel'
      };
      
      const score = decisionSupport.calculateOverallScore(property);
      
      assert.ok(score.score >= 0);
      assert.ok(score.score <= 100);
    });
  });
  
  describe('calculateOverallScore rating', () => {
    it('should return a rating for excellent property', () => {
      const property = { guestScore: 9.5, starRating: 5, amenities: ['Free WiFi', 'Breakfast', 'Air conditioning', 'Pool'], distanceFromCenter: '0.5km from center' };
      const score = decisionSupport.calculateOverallScore(property);
      assert.ok(score.rating);
      assert.ok(['Excellent Choice', 'Very Good', 'Good', 'Fair', 'Poor'].includes(score.rating));
    });
    
    it('should return a rating for average property', () => {
      const property = { guestScore: 7.0, starRating: 3, amenities: ['Free WiFi'], distanceFromCenter: '2km from center' };
      const score = decisionSupport.calculateOverallScore(property);
      assert.ok(score.rating);
    });
    
    it('should return a rating for poor property', () => {
      const property = { guestScore: 4.0, starRating: 1, amenities: [], distanceFromCenter: '10km from center' };
      const score = decisionSupport.calculateOverallScore(property);
      assert.ok(score.rating);
    });
  });
  
  describe('extractKeyFeatures', () => {
    it('should extract features for excellent property', () => {
      const property = {
        guestScore: 9.2,
        starRating: 4,
        amenities: ['Free WiFi', 'Breakfast included', 'Pool'],
        distanceFromCenter: '0.8km from center',
        cancellationPolicy: 'Free cancellation'
      };
      
      const features = decisionSupport.extractKeyFeatures(property);
      
      assert.ok(features.length > 0);
      assert.ok(features.length <= 5);
      assert.ok(features.some(f => f.type === 'positive'));
    });
    
    it('should highlight high guest score', () => {
      const property = {
        guestScore: 9.5,
        amenities: []
      };
      
      const features = decisionSupport.extractKeyFeatures(property);
      
      assert.ok(features.some(f => f.text.includes('9.5')));
    });
    
    it('should highlight important amenities', () => {
      const property = {
        guestScore: 8.0,
        amenities: ['Free WiFi', 'Breakfast included', 'Free parking']
      };
      
      const features = decisionSupport.extractKeyFeatures(property);
      
      assert.ok(features.some(f => f.text.includes('WiFi')));
    });
    
    it('should highlight free cancellation', () => {
      const property = {
        amenities: ['Free WiFi'],
        cancellationPolicy: 'Free cancellation available'
      };
      
      const features = decisionSupport.extractKeyFeatures(property);
      
      assert.ok(features.some(f => f.text.includes('Free cancellation')));
    });
  });
  
  describe('highlightConcerns', () => {
    it('should highlight low guest score', () => {
      const property = {
        guestScore: 6.5,
        amenities: []
      };
      
      const concerns = decisionSupport.highlightConcerns(property);
      
      assert.ok(concerns.some(c => c.text.includes('Low guest rating')));
    });
    
    it('should highlight limited reviews', () => {
      const property = {
        guestScore: 8.0,
        reviewCount: 25,
        amenities: []
      };
      
      const concerns = decisionSupport.highlightConcerns(property);
      
      assert.ok(concerns.some(c => c.text.includes('Limited reviews')));
    });
    
    it('should highlight far location', () => {
      const property = {
        amenities: [],
        distanceFromCenter: '8km from center'
      };
      
      const concerns = decisionSupport.highlightConcerns(property);
      
      assert.ok(concerns.some(c => c.text.includes('Far from')));
    });
    
    it('should highlight non-refundable policy', () => {
      const property = {
        amenities: [],
        cancellationPolicy: 'Non-refundable rate'
      };
      
      const concerns = decisionSupport.highlightConcerns(property);
      
      assert.ok(concerns.some(c => c.text.includes('Non-refundable')));
    });
    
    it('should detect concerns in description', () => {
      const property = {
        amenities: [],
        description: 'This property has no elevator access and shared bathroom facilities'
      };
      
      const concerns = decisionSupport.highlightConcerns(property);
      
      assert.ok(concerns.some(c => c.text.includes('No elevator')));
      assert.ok(concerns.some(c => c.text.includes('Shared bathroom')));
    });
    
    it('should return empty array for good property', () => {
      const property = {
        guestScore: 9.0,
        reviewCount: 500,
        amenities: ['Free WiFi', 'Breakfast'],
        distanceFromCenter: '0.5km from center',
        cancellationPolicy: 'Free cancellation'
      };
      
      const concerns = decisionSupport.highlightConcerns(property);
      
      assert.ok(Array.isArray(concerns));
      assert.strictEqual(concerns.length, 0);
    });
  });
  
  describe('createPriceBreakdown', () => {
    it('should create breakdown with total price', () => {
      const property = {
        pricePerNight: 100,
        totalPrice: 300,
        currency: 'USD'
      };
      
      const breakdown = decisionSupport.createPriceBreakdown(property);
      
      assert.strictEqual(breakdown.perNight, 100);
      assert.strictEqual(breakdown.total, 300);
      assert.ok(breakdown.taxes);
      assert.ok(breakdown.fees);
    });
    
    it('should handle missing total price', () => {
      const property = {
        pricePerNight: 150
      };
      
      const breakdown = decisionSupport.createPriceBreakdown(property);
      
      assert.strictEqual(breakdown.perNight, 150);
      assert.strictEqual(breakdown.total, null);
    });
  });
  
  describe('summarizeCancellation', () => {
    it('should summarize free cancellation', () => {
      const property = {
        cancellationPolicy: 'Free cancellation available'
      };
      
      const summary = decisionSupport.summarizeCancellation(property);
      
      assert.strictEqual(summary.type, 'flexible');
      assert.strictEqual(summary.flexible, true);
    });
    
    it('should summarize free cancellation with date', () => {
      const property = {
        cancellationPolicy: 'Free cancellation until March 15, 2026'
      };
      
      const summary = decisionSupport.summarizeCancellation(property);
      
      assert.strictEqual(summary.type, 'flexible');
      assert.ok(summary.text.includes('until'));
    });
    
    it('should summarize non-refundable', () => {
      const property = {
        cancellationPolicy: 'Non-refundable rate'
      };
      
      const summary = decisionSupport.summarizeCancellation(property);
      
      assert.strictEqual(summary.type, 'strict');
      assert.strictEqual(summary.flexible, false);
    });
    
    it('should handle missing policy', () => {
      const property = {};
      
      const summary = decisionSupport.summarizeCancellation(property);
      
      assert.strictEqual(summary.type, 'unknown');
      assert.strictEqual(summary.flexible, false);
    });
  });
  
  describe('generateRecommendation', () => {
    it('should recommend booking excellent property', () => {
      const property = {
        guestScore: 9.5,
        starRating: 5,
        amenities: ['Free WiFi', 'Breakfast'],
        distanceFromCenter: '0.5km from center',
        cancellationPolicy: 'Free cancellation'
      };
      
      const rec = decisionSupport.generateRecommendation(property);
      
      assert.strictEqual(rec.action, 'book');
      assert.strictEqual(rec.confidence, 'high');
    });
    
    it('should suggest considering good property', () => {
      const property = {
        guestScore: 8.0,
        starRating: 3,
        amenities: ['Free WiFi'],
        distanceFromCenter: '2km from center'
      };
      
      const rec = decisionSupport.generateRecommendation(property);
      
      assert.strictEqual(rec.action, 'consider');
      assert.strictEqual(rec.confidence, 'medium');
    });
    
    it('should suggest comparing for poor property', () => {
      const property = {
        guestScore: 6.0,
        reviewCount: 20,
        amenities: [],
        distanceFromCenter: '10km from center',
        cancellationPolicy: 'Non-refundable'
      };
      
      const rec = decisionSupport.generateRecommendation(property);
      
      assert.strictEqual(rec.action, 'compare');
      assert.strictEqual(rec.confidence, 'low');
    });
  });
  
  describe('suggestAlternatives', () => {
    it('should suggest better rating for low score', () => {
      const property = {
        guestScore: 7.0
      };
      
      const alternatives = decisionSupport.suggestAlternatives(property);
      
      assert.ok(alternatives.some(a => a.type === 'better_rating'));
    });
    
    it('should suggest flexible cancellation for strict policy', () => {
      const property = {
        cancellationPolicy: 'Non-refundable'
      };
      
      const alternatives = decisionSupport.suggestAlternatives(property);
      
      assert.ok(alternatives.some(a => a.type === 'flexible_cancellation'));
    });
    
    it('should suggest better location for far property', () => {
      const property = {
        distanceFromCenter: '5km from center'
      };
      
      const alternatives = decisionSupport.suggestAlternatives(property);
      
      assert.ok(alternatives.some(a => a.type === 'better_location'));
    });
    
    it('should suggest more amenities for sparse property', () => {
      const property = {
        amenities: ['Free WiFi']
      };
      
      const alternatives = decisionSupport.suggestAlternatives(property);
      
      assert.ok(alternatives.some(a => a.type === 'more_amenities'));
    });
  });
  
  describe('createDecisionSummary', () => {
    it('should create complete decision summary', () => {
      const property = {
        name: 'Hotel Paris',
        guestScore: 9.0,
        starRating: 4,
        amenities: ['Free WiFi', 'Breakfast', 'Gym'],
        distanceFromCenter: '1km from center',
        pricePerNight: 200,
        totalPrice: 600,
        cancellationPolicy: 'Free cancellation until March 15'
      };
      
      const summary = decisionSupport.createDecisionSummary(property);
      
      assert.ok(summary.property);
      assert.ok(summary.overallScore);
      assert.ok(summary.keyFeatures);
      assert.ok(summary.concerns !== undefined);
      assert.ok(summary.priceBreakdown);
      assert.ok(summary.cancellationSummary);
      assert.ok(summary.recommendation);
      assert.ok(summary.timestamp);
    });
    
    it('should handle minimal property', () => {
      const property = {
        name: 'Simple Hotel'
      };
      
      const summary = decisionSupport.createDecisionSummary(property);
      
      assert.ok(summary);
      assert.ok(summary.property);
    });
  });
  
  describe('formatDecisionSummary', () => {
    it('should format summary as text', () => {
      const summary = {
        property: 'Hotel Paris',
        overallScore: { score: 85, rating: 'Very Good' },
        keyFeatures: [
          { icon: '⭐', text: 'Great rating' },
          { icon: '📶', text: 'Free WiFi' }
        ],
        concerns: [],
        cancellationSummary: { flexible: true, text: 'Free cancellation' },
        recommendation: { action: 'consider', confidence: 'medium', text: 'Good option' }
      };
      
      const formatted = decisionSupport.formatDecisionSummary(summary);
      
      assert.ok(formatted.includes('Hotel Paris'));
      assert.ok(formatted.includes('85/100'));
      assert.ok(formatted.includes('Very Good'));
      assert.ok(formatted.includes('Free WiFi'));
    });
  });
  
  describe('askNextAction', () => {
    it('should suggest booking for excellent property', () => {
      const summary = {
        recommendation: { action: 'book' }
      };
      
      const actions = decisionSupport.askNextAction(summary);
      
      assert.ok(actions.options.some(o => o.includes('Book')));
    });
    
    it('should suggest considering for good property', () => {
      const summary = {
        recommendation: { action: 'consider' }
      };
      
      const actions = decisionSupport.askNextAction(summary);
      
      assert.ok(actions.options.some(o => o.includes('details')));
    });
    
    it('should suggest alternatives for poor property', () => {
      const summary = {
        recommendation: { action: 'compare' }
      };
      
      const actions = decisionSupport.askNextAction(summary);
      
      assert.ok(actions.options.some(o => o.includes('other')));
    });
  });

});
