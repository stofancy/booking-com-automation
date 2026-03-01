# Sprint 2: Hotel Search Implementation

**Sprint Goal**: Implement complete hotel search functionality from natural language input to results presentation.

**Duration**: 1-2 weeks  
**Priority**: Critical  
**Status**: 🟢 In Progress

---

## User Stories

### Story 2.1: Search Input Parser
**As a** user,  
**I want** to enter search criteria in natural language,  
**So that** I can search without filling forms manually.

#### Acceptance Criteria
- [ ] Parse destination city/location
- [ ] Parse check-in and check-out dates
- [ ] Parse guest count (adults, children)
- [ ] Parse room count
- [ ] Handle relative dates ("next weekend", "tomorrow")
- [ ] Handle flexible dates ("±3 days")
- [ ] Validate required fields

#### Tasks
- [ ] T2.1.1 - Create destination parser
- [ ] T2.1.2 - Create date parser (absolute & relative)
- [ ] T2.1.3 - Create guest/room parser
- [ ] T2.1.4 - Create flexible date handler
- [ ] T2.1.5 - Write parser unit tests
- [ ] T2.1.6 - Test with real examples

**Story Points**: 5  
**Epic**: Hotel Search  
**Priority**: Critical

---

### Story 2.2: Search Form Automation
**As the** skill,  
**I want** to fill the booking.com search form automatically,  
**So that** I can execute searches on behalf of the user.

#### Acceptance Criteria
- [ ] Navigate to booking.com homepage
- [ ] Fill destination field
- [ ] Fill check-in date
- [ ] Fill check-out date
- [ ] Set guest count and rooms
- [ ] Click search button
- [ ] Wait for results to load
- [ ] Handle errors (no results, invalid dates)

#### Tasks
- [ ] T2.2.1 - Create browser session manager
- [ ] T2.2.2 - Implement destination field filler
- [ ] T2.2.3 - Implement date picker handler
- [ ] T2.2.4 - Implement guest selector
- [ ] T2.2.5 - Implement search submission
- [ ] T2.2.6 - Add results wait logic
- [ ] T2.2.7 - Handle common errors
- [ ] T2.2.8 - Write integration tests

**Story Points**: 8  
**Epic**: Browser Automation + Hotel Search  
**Priority**: Critical

---

### Story 2.3: Results Extraction
**As the** skill,  
**I want** to extract hotel results from booking.com,  
**So that** I can present options to the user.

#### Acceptance Criteria
- [ ] Identify hotel result cards
- [ ] Extract hotel name
- [ ] Extract price (total and per night)
- [ ] Extract rating score and review count
- [ ] Extract location/distance
- [ ] Extract key amenities
- [ ] Extract booking.com link
- [ ] Handle multiple currencies
- [ ] Handle Genius discounts

#### Tasks
- [ ] T2.3.1 - Create result card selector
- [ ] T2.3.2 - Implement hotel name extractor
- [ ] T2.3.3 - Implement price extractor
- [ ] T2.3.4 - Implement rating extractor
- [ ] T2.3.5 - Implement location extractor
- [ ] T2.3.6 - Create link generator
- [ ] T2.3.7 - Handle currency variations
- [ ] T2.3.8 - Write parser tests with mock HTML

**Story Points**: 8  
**Epic**: Hotel Search  
**Priority**: Critical

---

### Story 2.4: Results Presentation
**As a** user,  
**I want** to see top 3-5 hotel options summarized,  
**So that** I can compare and choose quickly.

#### Acceptance Criteria
- [ ] Format results as text summary
- [ ] Show top 3-5 options (configurable)
- [ ] Include: name, price, rating, location, amenities
- [ ] Sort by best value (default) or price or rating
- [ ] Provide booking.com links for each
- [ ] Highlight best value option
- [ ] Handle no results gracefully
- [ ] Offer to refine search

#### Tasks
- [ ] T2.4.1 - Create result formatter
- [ ] T2.4.2 - Implement sorting logic
- [ ] T2.4.3 - Create summary template
- [ ] T2.4.4 - Add best value highlighter
- [ ] T2.4.5 - Handle no results case
- [ ] T2.4.6 - Write output tests

**Story Points**: 5  
**Epic**: Hotel Search  
**Priority**: High

---

## Implementation Plan

### Phase 1: Input Parser (Days 1-3)
1. Create `scripts/search-parser.js`
2. Implement destination, date, guest parsing
3. Write comprehensive unit tests
4. Test with real user queries

### Phase 2: Form Automation (Days 4-7)
1. Create `scripts/search-form.js`
2. Implement browser automation for search form
3. Handle date picker, guest selector
4. Add error handling and retries
5. Test with live booking.com

### Phase 3: Results (Days 8-10)
1. Create `scripts/results-extractor.js`
2. Implement result card parsing
3. Create result formatter
4. Test with various search results

### Phase 4: Integration (Days 11-14)
1. Create `scripts/hotel-search.js` (main entry point)
2. Integrate parser + form + results
3. End-to-end testing
4. Documentation and examples

---

## Technical Notes

### Browser Automation Pattern
```javascript
// Use browser tool with profile="chrome"
browser.snapshot({ profile: "chrome", refs: "aria" })
browser.act({ 
  profile: "chrome", 
  request: { kind: "type", ref: "e92", text: "Paris" }
})
```

### Selector Strategy
- Use ARIA refs when available (more stable)
- Fall back to CSS selectors
- Store selectors in `references/booking-selectors.md`
- Update selectors when booking.com changes UI

### Error Handling
- Timeout after 30 seconds for page loads
- Retry failed actions up to 3 times
- Clear error messages for user
- Screenshot on critical failures

---

## Testing Strategy

### Unit Tests
- Parser tests with sample queries
- Formatter tests with mock data
- Validator tests for edge cases

### Integration Tests
- Live search on booking.com
- Verify results extraction
- Test error scenarios

### Manual Testing
- Real user queries
- Various destinations and dates
- Different guest configurations

---

## Definition of Done

A story is complete when:
- ✅ Code implemented and working
- ✅ Unit tests written and passing
- ✅ Integration tested on live booking.com
- ✅ Error handling implemented
- ✅ Documentation updated
- ✅ CI pipeline passes

---

## Sprint Metrics

- **Total Stories**: 4
- **Total Points**: 26
- **Total Tasks**: 26
- **Estimated Duration**: 10-14 days
- **Start Date**: 2026-03-01
- **Target Completion**: 2026-03-15

---

Last Updated: 2026-03-01  
Next Review: After Story 2.1 completion
