# Integration Test Plan

**Created**: 2026-03-01  
**Status**: Ready for Implementation  
**Test Framework**: Node.js native test runner

---

## 🎯 Test Strategy

Based on manual testing results (40/40 tests passing), we'll create integration tests that:

1. **Run on real booking.com** (not mocks)
2. **Use Chrome extension relay** (profile="chrome")
3. **Test complete user flows** (end-to-end)
4. **Verify extraction accuracy** (compare extracted vs actual)

---

## 📁 Test File Structure

```
tests/
├── unit/                          # Existing unit tests (186 tests)
│   ├── search-parser.test.js
│   ├── search-form.test.js
│   ├── results-extractor.test.js
│   ├── results-presenter.test.js
│   ├── property-selector.test.js
│   ├── property-details.test.js
│   ├── decision-support.test.js
│   ├── room-extractor.test.js
│   ├── rate-comparison.test.js
│   └── room-selection.test.js
│
├── integration/                   # NEW - Integration tests
│   ├── browser-connection.test.js    # Test browser connectivity
│   ├── search-flow.test.js           # Search → Results flow
│   ├── property-flow.test.js         # Results → Property → Rooms flow
│   ├── booking-flow.test.js          # Complete booking flow (partial)
│   └── helpers/
│       └── browser-helpers.js        # Shared browser utilities
│
└── mocks/                         # HTML samples for unit tests
    └── booking-search-results.html
```

---

## 🧪 Integration Test Suites

### Suite 1: Browser Connection (5 tests)

**File**: `tests/integration/browser-connection.test.js`

| Test | Description | Expected |
|------|-------------|----------|
| 1.1 | Browser relay is running | status.running = true |
| 1.2 | Can connect to Chrome | profile="chrome" works |
| 1.3 | Can navigate to booking.com | URL = booking.com |
| 1.4 | Can capture snapshot | snapshot.length > 0 |
| 1.5 | Can interact with elements | click/type works |

**Estimated Time**: 2-3 minutes

---

### Suite 2: Search Flow (8 tests)

**File**: `tests/integration/search-flow.test.js`

| Test | Description | Expected |
|------|-------------|----------|
| 2.1 | Navigate to homepage | URL = booking.com |
| 2.2 | Fill destination field | "Paris" entered |
| 2.3 | Fill dates | Dates selected |
| 2.4 | Fill guests | 2 adults set |
| 2.5 | Submit search | Results page loads |
| 2.6 | Extract results | 10+ properties found |
| 2.7 | Verify result structure | Names, prices, ratings extracted |
| 2.8 | Verify result accuracy | Extracted matches displayed |

**Estimated Time**: 5-7 minutes

---

### Suite 3: Property Flow (10 tests)

**File**: `tests/integration/property-flow.test.js`

| Test | Description | Expected |
|------|-------------|----------|
| 3.1 | Click first property | Property page loads |
| 3.2 | Extract property name | Name matches listing |
| 3.3 | Extract star rating | Rating extracted (4 stars) |
| 3.4 | Extract guest score | Score extracted (9.2) |
| 3.5 | Extract review count | Count extracted (1,493) |
| 3.6 | Extract location | Address extracted |
| 3.7 | Extract facilities | 10+ amenities found |
| 3.8 | Navigate to rooms | Room table visible |
| 3.9 | Extract room options | 5+ rooms found |
| 3.10 | Verify room prices | Prices extracted correctly |

**Estimated Time**: 8-10 minutes

---

### Suite 4: Booking Flow (7 tests)

**File**: `tests/integration/booking-flow.test.js`

| Test | Description | Expected |
|------|-------------|----------|
| 4.1 | Select available dates | Dates with availability |
| 4.2 | View room options | Room table loads |
| 4.3 | Extract room details | Name, beds, size extracted |
| 4.4 | Extract pricing | Price + taxes extracted |
| 4.5 | Extract policies | Cancellation policy extracted |
| 4.6 | Click Reserve button | Guest details page OR error |
| 4.7 | Verify guest form fields | Name, email, phone fields exist |

**Note**: Test 4.6-4.7 may require actual booking or stop at payment

**Estimated Time**: 5-7 minutes

---

## 🔧 Test Helpers

**File**: `tests/integration/helpers/browser-helpers.js`

```javascript
// Shared utilities for integration tests

export async function waitForPageLoad(browser, timeout = 10000) {
  // Wait for page to fully load
}

export async function takeSnapshot(browser) {
  // Capture page snapshot with error handling
}

export async function verifyElementExists(browser, ref) {
  // Verify element exists on page
}

export async function extractAndVerify(browser, extractor, expected) {
  // Extract data and verify against expected values
}
```

---

## 📊 Test Configuration

**File**: `tests/integration/config.js`

```javascript
export const TEST_CONFIG = {
  browser: {
    profile: 'chrome',
    timeout: 30000
  },
  booking: {
    baseUrl: 'https://www.booking.com',
    testDestination: 'Paris',
    testDates: {
      checkin: '2026-03-30',
      checkout: '2026-03-31'
    },
    testGuests: 2
  },
  thresholds: {
    minResults: 10,
    minRooms: 3,
    accuracyThreshold: 0.9
  }
};
```

---

## 🚀 Running Integration Tests

### Run All Tests
```bash
npm test
```

### Run Integration Tests Only
```bash
npm run test:integration
```

### Run Specific Suite
```bash
node --test tests/integration/search-flow.test.js
```

### Run with Coverage
```bash
npm run test:coverage
```

---

## ⚠️ Test Considerations

### Rate Limiting
- Add delays between tests (1-2 seconds)
- Don't run tests in parallel on booking.com
- Respect robots.txt

### Data Volatility
- Prices change frequently
- Availability changes
- Use flexible assertions (ranges, not exact values)

### Selector Stability
- Use ARIA refs when possible
- Fall back to data-testid
- Avoid CSS selectors that change

### Authentication
- Tests run as logged-in user (Genius Level 1)
- Some features may require login
- Document auth requirements

---

## 📈 Implementation Priority

| Priority | Suite | Tests | Est. Time |
|----------|-------|-------|-----------|
| 🔴 High | Browser Connection | 5 | 1 hour |
| 🔴 High | Search Flow | 8 | 2 hours |
| 🟡 Medium | Property Flow | 10 | 3 hours |
| 🟡 Medium | Booking Flow | 7 | 2 hours |
| 🟢 Low | Helpers & Config | - | 1 hour |
| **Total** | | **30 tests** | **9 hours** |

---

## ✅ Definition of Done

Integration tests are complete when:

- [ ] All 30 integration tests written
- [ ] All tests passing on real booking.com
- [ ] Tests run in <30 minutes total
- [ ] No rate limiting issues
- [ ] CI configured to run integration tests
- [ ] Test documentation complete

---

## 🎯 Next Steps

1. **Create browser helpers** (1 hour)
2. **Implement browser connection tests** (1 hour)
3. **Implement search flow tests** (2 hours)
4. **Implement property flow tests** (3 hours)
5. **Implement booking flow tests** (2 hours)
6. **Configure CI for integration tests** (1 hour)

**Total Estimated Time**: 10 hours

---

**Ready to start implementation!**
