const { describe, it } = require('node:test');
const assert = require('node:assert');
const resultsExtractor = require('../../scripts/results-extractor.js');

describe('Results Extractor', () => {
  
  describe('getRatingCategory', () => {
    it('should return "Exceptional" for scores 9.0+', () => {
      assert.strictEqual(resultsExtractor.getRatingCategory(9.0), 'Exceptional');
      assert.strictEqual(resultsExtractor.getRatingCategory(9.5), 'Exceptional');
      assert.strictEqual(resultsExtractor.getRatingCategory(10), 'Exceptional');
    });
    
    it('should return "Very Good" for scores 8.0-8.9', () => {
      assert.strictEqual(resultsExtractor.getRatingCategory(8.0), 'Very Good');
      assert.strictEqual(resultsExtractor.getRatingCategory(8.5), 'Very Good');
    });
    
    it('should return "Good" for scores 7.0-7.9', () => {
      assert.strictEqual(resultsExtractor.getRatingCategory(7.0), 'Good');
      assert.strictEqual(resultsExtractor.getRatingCategory(7.5), 'Good');
    });
    
    it('should return "Pleasant" for scores 6.0-6.9', () => {
      assert.strictEqual(resultsExtractor.getRatingCategory(6.0), 'Pleasant');
      assert.strictEqual(resultsExtractor.getRatingCategory(6.5), 'Pleasant');
    });
    
    it('should return "Okay" for scores below 6.0', () => {
      assert.strictEqual(resultsExtractor.getRatingCategory(5.0), 'Okay');
      assert.strictEqual(resultsExtractor.getRatingCategory(0), 'Okay');
    });
  });

});
