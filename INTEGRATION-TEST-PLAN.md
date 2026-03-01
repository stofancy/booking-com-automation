# Integration Test Plan

**Created**: 2026-03-01  
**Priority**: High  
**Estimated Time**: 3-5 hours for full implementation

---

## 🎯 Test Strategy

Three levels of integration testing:

### Level 1: Semi-Integration (Mock HTML) - 1-2 hours
Test parsers against real HTML samples from booking.com

### Level 2: Full Integration (Live Browser) - 2-3 hours  
Test complete flow on live booking.com with browser automation

### Level 3: End-to-End (Complete User Journey) - 1-2 hours
Test entire booking flow from search to property details

---

## 📋 Level 1: Semi-Integration Tests (Mock HTML)

### Test 1.1: Search Results HTML Parsing

**File**: `tests/integration/search-results.test.js`

**Setup**:
```javascript
// Load real HTML sample from booking.com search results
const searchResultsHtml = fs.readFileSync(
  'tests/mocks/booking-search-results.html', 
  'utf8'
);
```

**Tests**:
- [ ] Parse hotel names from real HTML
- [ ] Parse prices from real HTML
- [ ] Parse ratings from real HTML
- [ ] Parse locations from real HTML
- [ ] Handle multiple result cards
- [ ] Handle Genius badges
- [ ] Handle free cancellation badges

**Mock Files Needed**:
- `tests/mocks/booking-search-results.html`
- `tests/mocks/booking-search-results-empty.html`
- `tests/mocks/booking-search-results-error.html`

**Estimated Time**: 1 hour

---

### Test 1.2: Property Details HTML Parsing

**File**: `tests/integration/property-details.test.js`

**Setup**:
```javascript
// Load real HTML sample from property page
const propertyHtml = fs.readFileSync(
  'tests/mocks/booking-property-page.html',
  'utf8'
);
```

**Tests**:
- [ ] Extract hotel name
- [ ] Extract star rating
- [ ] Extract guest score
- [ ] Extract amenities list
- [ ] Extract room options
- [ ] Extract cancellation policy
- [ ] Handle missing data gracefully

**Mock Files Needed**:
- `tests/mocks/booking-property-page.html`
- `tests/mocks/booking-property-page-no-rooms.html`

**Estimated Time**: 1 hour

---

## 📋 Level 2: Full Integration Tests (Live Browser)

### Test 2.1: Browser Connection

**File**: `tests/integration/browser-connection.test.js`

**Tests**:
```javascript
// Test browser is accessible
const status = await browser.status({ profile: 'chrome' });
assert.ok(status.running, 'Browser should be running');

// Test tab is attached
const tabs = await browser.tabs({ profile: 'chrome' });
assert.ok(tabs.length > 0, 'At least one tab should be open');

// Test snapshot works
const snapshot = await browser.snapshot({ profile: 'chrome' });
assert.ok(snapshot.length > 0, 'Snapshot should not be empty');
```

**Requirements**:
- Chrome with Browser Relay extension
- booking.com tab attached
- Network connection

**Estimated Time**: 30 minutes

---

### Test 2.2: Search Form Automation

**File**: `tests/integration/search-form.test.js`

**Tests**:
```javascript
// Navigate to booking.com
await browser.navigate({ 
  profile: 'chrome', 
  targetUrl: 'https://www.booking.com' 
});

// Wait for homepage
await waitForPageLoad(browser);

// Fill search form
await fillSearchForm(browser, {
  destination: 'Paris',
  checkIn: '2026-04-01',
  checkOut: '2026-04-05',
  adults: 2
});

// Submit search
await submitSearch(browser);

// Verify results page loaded
const snapshot = await browser.snapshot({ profile: 'chrome' });
assert.ok(snapshot.includes('Paris'), 'Should show Paris results');
```

**Test Cases**:
- [ ] Navigate to booking.com
- [ ] Fill destination field
- [ ] Fill dates (absolute dates)
- [ ] Fill dates (relative dates)
- [ ] Fill guest count
- [ ] Submit search
- [ ] Wait for results
- [ ] Handle no results
- [ ] Handle errors

**Estimated Time**: 1.5 hours

---

### Test 2.3: Results Extraction

**File**: `tests/integration/results-extraction.test.js`

**Tests**:
```javascript
// Extract results from live page
const results = await extractResults(browser, { maxResults: 5 });

assert.ok(results.length > 0, 'Should extract at least one result');
assert.ok(results[0].name, 'Should have hotel name');
assert.ok(results[0].pricePerNight, 'Should have price');
assert.ok(results[0].rating, 'Should have rating');
```

**Test Cases**:
- [ ] Extract hotel names
- [ ] Extract prices
- [ ] Extract ratings
- [ ] Extract locations
- [ ] Extract amenities
- [ ] Handle Genius badges
- [ ] Handle free cancellation
- [ ] Limit to maxResults

**Estimated Time**: 1 hour

---

### Test 2.4: Property Selection

**File**: `tests/integration/property-selection.test.js`

**Tests**:
```javascript
// Select first property
const result = await selectProperty(browser, results, 1);

assert.ok(result.success, 'Should successfully select property');

// Verify on property details page
const snapshot = await browser.snapshot({ profile: 'chrome' });
assert.ok(
  isOnPropertyDetailsPage(snapshot),
  'Should be on property details page'
);
```

**Test Cases**:
- [ ] Click on property
- [ ] Navigate to details page
- [ ] Wait for page load
- [ ] Handle popups (cookies)
- [ ] Go back to results

**Estimated Time**: 1 hour

---

## 📋 Level 3: End-to-End Tests

### Test 3.1: Complete User Journey

**File**: `tests/integration/complete-flow.test.js`

**Test**:
```javascript
// Complete flow from search to property details
const searchParams = parseSearchQuery('Hotels in Paris, April 1-5');
await fillSearchForm(browser, searchParams);
await submitSearch(browser);
const results = await extractResults(browser);
const presentation = await presentResults(results);
const selected = await selectProperty(browser, results, 1);
const details = await extractPropertyDetails(browser);

// Verify complete flow
assert.ok(selected.success, 'Should select property');
assert.ok(details.name, 'Should extract property details');
```

**Flow**:
1. Parse search query
2. Fill search form
3. Submit search
4. Extract results
5. Present results
6. Select property
7. Extract property details

**Estimated Time**: 1.5 hours

---

## 📁 Test File Structure

```
tests/
├── integration/
│   ├── search-results.test.js       (Level 1)
│   ├── property-details.test.js     (Level 1)
│   ├── browser-connection.test.js   (Level 2)
│   ├── search-form.test.js          (Level 2)
│   ├── results-extraction.test.js   (Level 2)
│   ├── property-selection.test.js   (Level 2)
│   └── complete-flow.test.js        (Level 3)
├── mocks/
│   ├── booking-search-results.html
│   ├── booking-search-results-empty.html
│   ├── booking-property-page.html
│   └── booking-property-page-no-rooms.html
└── smoke-test.js                    (Already exists)
```

---

## 🎯 Quick Test Plan (What I'll do NOW)

Before implementing full integration suite, I'll do a **quick REAL test**:

### Quick Real Test Checklist (30 min)

1. **[ ] Open booking.com in Chrome**
   - Navigate to booking.com
   - Attach tab with Browser Relay

2. **[ ] Test Search Form**
   - Verify destination input works
   - Verify date picker works
   - Verify guest selector works
   - Submit a real search

3. **[ ] Test Results Page**
   - Verify results load
   - Check property card structure
   - Verify selectors match current UI

4. **[ ] Test Property Details**
   - Click on a property
   - Verify details page loads
   - Check for hotel name, ratings, amenities

5. **[ ] Document Findings**
   - Note any selector mismatches
   - Note any UI changes
   - Update selectors if needed

---

## 📊 Test Priority

| Priority | Test | Time | Value |
|----------|------|------|-------|
| 🔴 **Critical** | Quick Real Test (NOW) | 30 min | Validate current implementation |
| 🟡 **High** | Level 1 (Mock HTML) | 2 hours | Test parsers with real HTML |
| 🟡 **High** | Level 2 (Live Browser) | 3 hours | Test automation flow |
| 🟢 **Medium** | Level 3 (E2E) | 1.5 hours | Test complete journey |

---

## ✅ Definition of Done

Integration testing is complete when:

- [ ] Quick real test completed (selectors verified)
- [ ] Level 1 tests implemented and passing
- [ ] Level 2 tests implemented and passing
- [ ] Level 3 tests implemented and passing
- [ ] All selectors updated and accurate
- [ ] Error scenarios tested
- [ ] CI runs integration tests on push

---

**Next Action**: Quick Real Test on booking.com (30 min)  
**After That**: Implement Level 1 tests (Mock HTML)  
**Then**: Continue with Story 4.2 or full integration suite

---

**Created**: 2026-03-01 16:21 GMT+8  
**Status**: 🟡 Ready to execute Quick Real Test
