---
name: booking-com-automation
description: Automate complete hotel booking on booking.com from search to payment page.
---

# Booking.com Automation Skill

Automate hotel searches and booking on booking.com using browser automation.

## When to Use

✅ **USE this skill when:**

- 🏨 Searching for hotels in a destination
- 💰 Comparing hotel prices across different dates
- 🎯 Finding accommodations within a budget
- ⭐ Filtering hotels by amenities, ratings, or location
- 📊 Getting summaries of top 3-5 hotel options
- 🛏️ **Selecting rooms and viewing rate options**
- 📝 **Filling guest details automatically**
- 💳 **Reaching payment page ready for completion**

❌ **DON'T use this skill when:**

- ✗ Completing payment (you finish manually at payment page)
- ✗ Managing or modifying existing reservations
- ✗ Searching on other travel sites (Expedia, Kayak, etc.)
- ✗ ✈️ Flight search (deferred - hotel booking first)
- ✗ Booking car rentals or airport taxis (not yet supported)

## Setup

### Prerequisites

1. **OpenClaw** installed with browser tooling
2. **Chrome extension relay** configured (Browser Relay extension installed)
3. **booking.com account** with active login session

### Configuration

The skill uses Chrome extension relay by default for fast, session-persistent browsing.

```bash
# Verify browser relay is working
openclaw browser status
```

Ensure you're logged into booking.com in your Chrome browser before using this skill.

## Usage

### Quick Search (Search Only)

```
Find hotels in Paris, March 15-20, 2 guests, under $200/night
```

```
Search 4-star hotels in Barcelona near city center, April 10-15
```

```
Best rated hotels in Tokyo with free WiFi and breakfast, May 1-7
```

### Full Booking (Search → Payment Page)

```
Book a hotel in Paris, March 15-20, 2 guests, budget $200/night
```

```
Find and reserve a hotel in Barcelona, April 10-15, I'll provide guest details
```

```
Search hotels in Tokyo, select best value, fill my guest info, stop at payment
```

### Guest Profile (Save Your Details)

```
Save my guest profile: John Smith, john@email.com, +1-555-0123, USA
```

```
Use my saved profile for booking
```

```
Update my phone number to +1-555-9999
```

### Flexible Date Search

```
Hotels in Rome, weekend in March, compare prices across weekends
```

```
Best hotel deals in Bangkok, flexible dates in April, show cheapest
```

### Coming Later ✈️

Flight search is deferred until hotel booking is complete.

## Output Format

The skill returns text summaries with 3-5 hotel options:

### Example Output

```
🏨 Found 5 hotels in Paris (March 15-20, 2026, 2 guests):

1. Hotel Le Marais - $189/night ⭐ 8.7/10 (1,234 reviews)
   Location: Le Marais district, 0.5km from city center
   Amenities: Free WiFi, Breakfast, Air conditioning
   [Book on booking.com](https://booking.com/...)

2. Grand Hotel du Louvre - $215/night ⭐ 9.1/10 (892 reviews)
   Location: 1st Arrondissement, 0.2km from Louvre
   Amenities: Free WiFi, Gym, Restaurant, Room service
   [Book on booking.com](https://booking.com/...)

3. Hotel Saint-Germain - $167/night ⭐ 8.4/10 (2,103 reviews)
   Location: Saint-Germain-des-Prés, 1.2km from city center
   Amenities: Free WiFi, Breakfast included
   [Book on booking.com](https://booking.com/...)

... (2 more options)

💡 Best value: Option 3 (Hotel Saint-Germain) - great rating at lowest price
```

## Advanced Features

### Sorting Options

Results can be sorted by:

- **Best value** (default) - balance of price and quality
- **Cheapest** - lowest price first
- **Fastest** (flights) - shortest duration
- **Highest rated** (hotels) - best guest reviews

### Filters

Supported filters:

- ⭐ Star rating (1-5 stars)
- 📊 Guest rating (minimum score, e.g., 8.0+)
- 💰 Price range (min-max per night)
- 🏊 Amenities (WiFi, pool, gym, parking, breakfast, etc.)
- 📍 Distance from city center or specific landmark
- 🏨 Hotel type (apartment, resort, hostel, etc.)

### Error Handling

Common errors and solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| "Not logged in" | No active booking.com session | Log in to booking.com in Chrome |
| "No results found" | No matches for criteria | Try different dates or relax filters |
| "Search timeout" | Slow page load | Retry, check internet connection |
| "Cannot parse results" | booking.com layout changed | Report issue, skill needs update |

## Implementation

### Skill Not Triggering

Ensure the skill description matches your query. Try:
- "Search flights..."
- "Find hotels..."
- "Book.com flights..."

### Browser Issues

If browser automation fails:

1. Check Chrome extension relay status: `openclaw browser status`
2. Ensure booking.com tab is attached to relay
3. Restart browser relay if needed

### Outdated Selectors

booking.com occasionally updates their UI. If searches fail:

1. Check for skill updates: `clawhub update booking-com-automation`
2. Report issue on GitHub with error details
3. Check references/booking-selectors.md for known issues

## Implementation

This skill provides a complete booking automation flow. OpenClaw Agent can call the `run()` function directly or use the CLI.

### Entry Point

**File**: `index.js`

```javascript
// As a module
const { run } = require('./index.js');
const result = await run({
  query: "Hotels in Paris, March 15-20, 2 guests",
  browser: browserContext  // Optional, for full automation
});
```

**CLI Usage**:
```bash
node index.js "Hotels in Paris, March 15-20, 2 guests"
node index.js --metadata  # Show available modules
node index.js --help
```

### API

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Natural language search query |
| `browser` | object | No | Browser context for automation |
| `context` | object | No | Additional context |

**Returns**:
```javascript
{
  success: true,
  message: "Query parsed successfully...",
  data: {
    parsed: { destination, dates, guests, budget },
    summary: "📍 paris • 📅 2026-03-15 to 2026-03-20",
    availableModules: ["search-form", "results-extractor", ...]
  }
}
```

### Available Modules

| Module | File | Description |
|--------|------|-------------|
| `searchParser` | `scripts/search-parser.js` | Parse natural language into structured search params |
| `searchForm` | `scripts/search-form.js` | Fill and submit search form on booking.com |
| `resultsExtractor` | `scripts/results-extractor.js` | Extract hotel data from search results |
| `resultsPresenter` | `scripts/results-presenter.js` | Format and present search results |
| `propertySelector` | `scripts/property-selector.js` | Select property from results |
| `propertyDetails` | `scripts/property-details.js` | Extract property details |
| `decisionSupport` | `scripts/decision-support.js` | Analyze and recommend properties |
| `roomExtractor` | `scripts/room-extractor.js` | Extract room options and rates |
| `rateComparison` | `scripts/rate-comparison.js` | Compare room rates and values |
| `roomSelection` | `scripts/room-selection.js` | Select room and proceed |
| `guestDetails` | `scripts/guest-details.js` | Fill guest information form |
| `paymentHandoff` | `scripts/payment-handoff.js` | Navigate to payment page |

### Full Booking Flow

```
query → searchParser → searchForm → resultsExtractor → resultsPresenter
                                                      ↓
                                              propertySelector
                                                      ↓
                                              propertyDetails
                                                      ↓
                                              roomExtractor
                                                      ↓
                                              rateComparison
                                                      ↓
                                              roomSelection
                                                      ↓
                                              guestDetails
                                                      ↓
                                              paymentHandoff → User completes payment
```

## Contributing

Found a bug or want to contribute? See [CONTRIBUTING.md](https://github.com/stofancy/booking-com-automation/blob/main/CONTRIBUTING.md)

## License

MIT License - See [LICENSE](https://github.com/stofancy/booking-com-automation/blob/main/LICENSE)

---

**Version**: 1.0.0  
**Last Updated**: 2026-03-04  
**Author**: stofancy  
**Repository**: https://github.com/stofancy/booking-com-automation
