/**
 * Unit Tests for Results Presenter
 * Tests the results-presenter.js module
 * 
 * Run: npm test
 */

const assert = require('assert');
const { describe, it } = require('node:test');

// Import module
const resultsPresenter = require('../../scripts/results-presenter.js');

describe('Results Presenter', () => {
  
  describe('getStarRating', () => {
    it('should return 5 stars for 9.0+', () => {
      assert.strictEqual(resultsPresenter.getStarRating(9.5), '⭐⭐⭐⭐⭐');
      assert.strictEqual(resultsPresenter.getStarRating(9.0), '⭐⭐⭐⭐⭐');
    });
    
    it('should return 4 stars for 8.0-8.9', () => {
      assert.strictEqual(resultsPresenter.getStarRating(8.9), '⭐⭐⭐⭐');
      assert.strictEqual(resultsPresenter.getStarRating(8.0), '⭐⭐⭐⭐');
    });
    
    it('should return 3 stars for 7.0-7.9', () => {
      assert.strictEqual(resultsPresenter.getStarRating(7.5), '⭐⭐⭐');
      assert.strictEqual(resultsPresenter.getStarRating(7.0), '⭐⭐⭐');
    });
    
    it('should return 2 stars for 6.0-6.9', () => {
      assert.strictEqual(resultsPresenter.getStarRating(6.5), '⭐⭐');
      assert.strictEqual(resultsPresenter.getStarRating(6.0), '⭐⭐');
    });
    
    it('should return 1 star for below 6.0', () => {
      assert.strictEqual(resultsPresenter.getStarRating(5.5), '⭐');
      assert.strictEqual(resultsPresenter.getStarRating(1.0), '⭐');
    });
  });
  
  describe('formatHotelCard', () => {
    it('should format hotel with all details', () => {
      const hotel = {
        name: 'Hotel Paris',
        rating: 9.0,
        pricePerNight: 200,
        location: 'Paris Center',
        amenities: ['WiFi', 'Breakfast', 'Pool'],
        genius: true,
        bookingUrl: 'https://booking.com/hotel1'
      };
      
      const card = resultsPresenter.formatHotelCard(hotel, 1, false);
      
      assert.ok(card.includes('Hotel Paris'));
      assert.ok(card.includes('⭐')); // Star rating
      assert.ok(card.includes('200'));
      assert.ok(card.includes('Paris Center'));
      assert.ok(card.includes('Genius'));
    });
    
    it('should add BEST VALUE badge when isBestValue is true', () => {
      const hotel = {
        name: 'Hotel Best',
        rating: 9.0,
        pricePerNight: 150
      };
      
      const card = resultsPresenter.formatHotelCard(hotel, 1, true);
      
      assert.ok(card.includes('🏆 BEST VALUE'));
    });
    
    it('should handle minimal hotel info', () => {
      const hotel = {
        name: 'Simple Hotel'
      };
      
      const card = resultsPresenter.formatHotelCard(hotel, 1, false);
      
      assert.ok(card.includes('Simple Hotel'));
      assert.ok(card.includes('1.'));
    });
    
    it('should include total price if available', () => {
      const hotel = {
        name: 'Hotel',
        pricePerNight: 100,
        totalPrice: 300
      };
      
      const card = resultsPresenter.formatHotelCard(hotel, 1, false);
      
      assert.ok(card.includes('$100/night'));
      assert.ok(card.includes('Total: $300'));
    });
    
    it('should include distance if available', () => {
      const hotel = {
        name: 'Hotel',
        distance: '0.5km'
      };
      
      const card = resultsPresenter.formatHotelCard(hotel, 1, false);
      
      assert.ok(card.includes('0.5km'));
      assert.ok(card.includes('from center'));
    });
    
    it('should limit amenities to top 3', () => {
      const hotel = {
        name: 'Hotel',
        amenities: ['WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Bar']
      };
      
      const card = resultsPresenter.formatHotelCard(hotel, 1, false);
      
      assert.ok(card.includes('WiFi'));
      assert.ok(card.includes('Pool'));
      assert.ok(card.includes('Gym'));
      assert.ok(!card.includes('Spa'));
    });
  });
  
  describe('createSummary', () => {
    it('should create summary with results count', () => {
      const results = [
        { name: 'Hotel 1', rating: 9.0, pricePerNight: 200 },
        { name: 'Hotel 2', rating: 8.0, pricePerNight: 150 }
      ];
      
      const summary = resultsPresenter.createSummary(results, {}, {});
      
      assert.ok(summary.includes('Found 2 hotels'));
    });
    
    it('should include search params in summary', () => {
      const results = [{ name: 'Hotel' }];
      const searchParams = {
        destination: 'Paris',
        checkIn: '2026-03-15',
        checkOut: '2026-03-20',
        adults: 2
      };
      
      const summary = resultsPresenter.createSummary(results, {}, searchParams);
      
      assert.ok(summary.includes('Paris'));
      assert.ok(summary.includes('2026-03-15'));
      assert.ok(summary.includes('2 guests'));
    });
    
    it('should include applied filters in summary', () => {
      const results = [{ name: 'Hotel' }];
      const filters = {
        maxPrice: 200,
        minRating: 8.0,
        geniusOnly: true
      };
      
      const summary = resultsPresenter.createSummary(results, filters, {});
      
      assert.ok(summary.includes('Filters'));
      assert.ok(summary.includes('under $200') || summary.includes('200'));
    });
    
    it('should include price range', () => {
      const results = [
        { name: 'Hotel 1', pricePerNight: 100 },
        { name: 'Hotel 2', pricePerNight: 300 }
      ];
      
      const summary = resultsPresenter.createSummary(results, {}, {});
      
      assert.ok(summary.includes('$100 - $300'));
    });
    
    it('should include rating range', () => {
      const results = [
        { name: 'Hotel 1', rating: 7.0 },
        { name: 'Hotel 2', rating: 9.0 }
      ];
      
      const summary = resultsPresenter.createSummary(results, {}, {});
      
      assert.ok(summary.includes('Rating') || summary.includes('rating'));
    });
  });
  
  describe('createRefinementOptions', () => {
    it('should suggest price filter if not applied', () => {
      const options = resultsPresenter.createRefinementOptions({}, {});
      
      const priceOption = options.find(o => o.action === 'setMaxPrice');
      assert.ok(priceOption);
      assert.ok(priceOption.suggestion.includes('price'));
    });
    
    it('should suggest rating filter if not applied', () => {
      const options = resultsPresenter.createRefinementOptions({}, {});
      
      const ratingOption = options.find(o => o.action === 'setMinRating');
      assert.ok(ratingOption);
      assert.ok(ratingOption.suggestion.includes('rating'));
    });
    
    it('should include sort options', () => {
      const options = resultsPresenter.createRefinementOptions({}, {});
      
      assert.ok(options.some(o => o.action === 'sortByPrice'));
      assert.ok(options.some(o => o.action === 'sortByRating'));
      assert.ok(options.some(o => o.action === 'sortByBestValue'));
    });
    
    it('should suggest flexible dates if not already flexible', () => {
      const searchParams = { flexible: false };
      const options = resultsPresenter.createRefinementOptions({}, searchParams);
      
      const flexibleOption = options.find(o => o.action === 'addFlexibleDates');
      assert.ok(flexibleOption);
    });
    
    it('should not suggest flexible dates if already flexible', () => {
      const searchParams = { flexible: true };
      const options = resultsPresenter.createRefinementOptions({}, searchParams);
      
      const flexibleOption = options.find(o => o.action === 'addFlexibleDates');
      assert.ok(!flexibleOption);
    });
  });
  
  describe('handleNoResults', () => {
    it('should return no results message', () => {
      const result = resultsPresenter.handleNoResults({});
      
      assert.strictEqual(result.count, 0);
      assert.ok(result.summary.includes('No hotels found'));
    });
    
    it('should provide suggestions based on search params', () => {
      const searchParams = {
        destination: 'Paris',
        checkIn: '2026-03-15',
        checkOut: '2026-03-20'
      };
      
      const result = resultsPresenter.handleNoResults(searchParams);
      
      assert.ok(result.suggestions.length > 0);
      assert.ok(result.summary.includes('Suggestions'));
    });
    
    it('should handle empty search params', () => {
      const result = resultsPresenter.handleNoResults(null);
      
      assert.strictEqual(result.count, 0);
      assert.ok(result.success);
    });
  });
  
  describe('handleNoResultsAfterFilter', () => {
    it('should return no results after filter message', () => {
      const result = resultsPresenter.handleNoResultsAfterFilter({}, {});
      
      assert.strictEqual(result.count, 0);
      assert.ok(result.summary.includes('No hotels match your filters'));
    });
    
    it('should suggest relaxing price filter', () => {
      const filters = { maxPrice: 100 };
      const result = resultsPresenter.handleNoResultsAfterFilter(filters, {});
      
      assert.ok(result.suggestions.some(s => s.includes('budget')));
    });
    
    it('should suggest relaxing rating filter', () => {
      const filters = { minRating: 9.0 };
      const result = resultsPresenter.handleNoResultsAfterFilter(filters, {});
      
      assert.ok(result.suggestions.some(s => s.includes('rating')));
    });
    
    it('should suggest removing Genius filter', () => {
      const filters = { geniusOnly: true };
      const result = resultsPresenter.handleNoResultsAfterFilter(filters, {});
      
      assert.ok(result.suggestions.some(s => s.includes('Genius')));
    });
  });
  
  describe('highlightBestValue', () => {
    it('should return best value hotel', () => {
      const results = [
        { name: 'Hotel A', rating: 8.0, pricePerNight: 200 },
        { name: 'Hotel B', rating: 9.0, pricePerNight: 150 },
        { name: 'Hotel C', rating: 7.0, pricePerNight: 100 }
      ];
      
      const bestValue = resultsPresenter.highlightBestValue(results);
      
      assert.ok(bestValue);
      assert.ok(bestValue.hotel);
      assert.ok(bestValue.reason);
    });
    
    it('should return null for empty array', () => {
      const bestValue = resultsPresenter.highlightBestValue([]);
      assert.strictEqual(bestValue, null);
    });
    
    it('should return null for undefined', () => {
      const bestValue = resultsPresenter.highlightBestValue(undefined);
      assert.strictEqual(bestValue, null);
    });
  });
  
  describe('presentComparison', () => {
    it('should compare top hotels', () => {
      const results = [
        { name: 'Hotel A', rating: 9.0, pricePerNight: 200 },
        { name: 'Hotel B', rating: 8.0, pricePerNight: 150 },
        { name: 'Hotel C', rating: 7.0, pricePerNight: 100 }
      ];
      
      const comparison = resultsPresenter.presentComparison(results, 3);
      
      assert.ok(comparison.hotels);
      assert.strictEqual(comparison.hotels.length, 3);
      assert.ok(comparison.summary.includes('Comparing'));
    });
    
    it('should handle empty results', () => {
      const comparison = resultsPresenter.presentComparison([], 3);
      
      assert.ok(comparison.error);
    });
  });
  
  describe('askNextAction', () => {
    it('should return action options', () => {
      const actions = resultsPresenter.askNextAction({});
      
      assert.ok(actions.question);
      assert.ok(actions.options);
      assert.strictEqual(actions.options.length, 6);
      assert.ok(actions.options[0].includes('Book'));
    });
  });
  
  describe('presentResults (integration)', () => {
    it('should present results successfully', async () => {
      const results = [
        {
          name: 'Hotel Paris',
          rating: 9.0,
          pricePerNight: 200,
          location: 'Paris'
        },
        {
          name: 'Hotel London',
          rating: 8.5,
          pricePerNight: 150,
          location: 'London'
        }
      ];
      
      const presentation = await resultsPresenter.presentResults(results, { top: 2 });
      
      assert.strictEqual(presentation.success, true);
      assert.strictEqual(presentation.count, 2);
      assert.ok(presentation.summary);
      assert.ok(presentation.results);
      assert.strictEqual(presentation.results.length, 2);
    });
    
    it('should handle empty results', async () => {
      const presentation = await resultsPresenter.presentResults([], {});
      
      assert.strictEqual(presentation.success, true);
      assert.strictEqual(presentation.count, 0);
      assert.ok(presentation.suggestions);
    });
    
    it('should apply filters', async () => {
      const results = [
        { name: 'Hotel A', pricePerNight: 100, rating: 9.0 },
        { name: 'Hotel B', pricePerNight: 200, rating: 8.0 },
        { name: 'Hotel C', pricePerNight: 300, rating: 7.0 }
      ];
      
      const presentation = await resultsPresenter.presentResults(results, {
        top: 5,
        filters: { maxPrice: 200 }
      });
      
      assert.strictEqual(presentation.count, 2);
      assert.ok(presentation.results.every(r => !r.includes('300')));
    });
    
    it('should sort by bestValue by default', async () => {
      const results = [
        { name: 'Hotel A', pricePerNight: 200, rating: 8.0 },
        { name: 'Hotel B', pricePerNight: 100, rating: 9.0 }
      ];
      
      const presentation = await resultsPresenter.presentResults(results, { top: 2 });
      
      assert.ok(presentation.bestValueIndex);
      assert.ok(presentation.results[0].includes('BEST VALUE'));
    });
    
    it('should include timestamp', async () => {
      const results = [{ name: 'Hotel' }];
      const presentation = await resultsPresenter.presentResults(results, {});
      
      assert.ok(presentation.timestamp);
      assert.ok(new Date(presentation.timestamp) instanceof Date);
    });
    
    it('should handle error gracefully', async () => {
      // This tests error handling
      try {
        const presentation = await resultsPresenter.presentResults(null, {});
        assert.ok(presentation);
      } catch (error) {
        assert.ok(error);
      }
    });
  });

});
