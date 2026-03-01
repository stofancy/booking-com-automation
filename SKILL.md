---
name: booking-com-automation
description: Automate complete hotel booking on booking.com from search to payment page. Use when: (1) searching for hotels, (2) viewing property details, (3) selecting rooms, (4) filling guest details, (5) reaching payment page. NOT for: completing payment (user finishes manually), managing existing reservations, flight search (deferred), or non-booking.com sites.
metadata:
  {
    "openclaw":
      {
        "emoji": "✈️",
        "requires": { "bins": ["node"] },
        "install":
          [
            {
              "id": "npm",
              "kind": "npm",
              "package": "booking-com-automation",
              "label": "Install booking.com automation skill",
            },
          ],
      },
  }
---

# Booking.com Automation Skill

Automate flight and hotel searches on booking.com using browser automation.

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

## Development Status

🚧 **Under Active Development**

**Current Focus**: 🏨 Complete Hotel Booking (Search → Payment)  
**Current Sprint**: Foundation & Infrastructure (Epic 1)  
**Next Sprint**: Hotel Search (Epic 2)

See [GitHub Projects](https://github.com/stofancy/booking-com-automation/projects) for roadmap.

### Full Booking Flow Roadmap

| Phase | Epic | Feature | Status |
|-------|------|---------|--------|
| 1 | Epic 1 | Foundation & Infrastructure | 🟢 65% |
| 2 | Epic 2 | Hotel Search | ⚪ Next |
| 3 | Epic 3 | Browser Automation (Core) | ⚪ |
| 4 | Epic 4 | Property Selection & Details | ⚪ |
| 5 | Epic 5 | Room Selection | ⚪ |
| 6 | Epic 6 | Guest Details Form | ⚪ |
| 7 | Epic 7 | Payment Page Handoff | ⚪ |
| 8+ | Epic 9-11 | Polish, Testing, Publishing | ⚪ |

### MVP vs Full Booking

**MVP (Search Only)**: Epics 1-3 - Search and present hotel options  
**Full Booking**: Epics 1-7 - Complete booking to payment page

### Coming Later

- ✈️ Flight search (deferred - hotel booking first)
- 📦 Package deals (flight + hotel)
- 🔔 Price alerts
- 📋 Booking history access

## Troubleshooting

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

## Contributing

Found a bug or want to contribute? See [CONTRIBUTING.md](https://github.com/stofancy/booking-com-automation/blob/main/CONTRIBUTING.md)

## License

MIT License - See [LICENSE](https://github.com/stofancy/booking-com-automation/blob/main/LICENSE)

---

**Version**: 0.1.0  
**Last Updated**: 2026-03-01  
**Author**: stofancy  
**Repository**: https://github.com/stofancy/booking-com-automation
