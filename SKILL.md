---
name: booking-com-automation
description: Automate hotel searches on booking.com. Use when: (1) searching for hotels in a destination, (2) comparing prices across dates, (3) finding accommodations within budget, (4) filtering by amenities and ratings. NOT for: completing bookings (manual confirmation required), managing existing reservations, flight search (coming soon), or non-booking.com travel sites.
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
- 📊 Getting quick summaries of top 3-5 hotel options

❌ **DON'T use this skill when:**

- Completing actual bookings (requires manual confirmation)
- Managing or modifying existing reservations
- Searching on other travel sites (Expedia, Kayak, etc.)
- ✈️ Flight search (not yet implemented - coming soon)
- Booking car rentals or airport taxis (not yet supported)

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

### Hotel Search

```
Find hotels in Paris, March 15-20, 2 guests, under $200/night
```

```
Search 4-star hotels in Barcelona near city center, April 10-15
```

```
Best rated hotels in Tokyo with free WiFi and breakfast, May 1-7
```

```
Hotels in New York with gym and pool, under $300/night, Manhattan area
```

```
Cheap hotels in London, any rating, March 10-15, 1 guest
```

### Flexible Date Search

```
Hotels in Rome, weekend in March, compare prices across weekends
```

```
Best hotel deals in Bangkok, flexible dates in April, show cheapest
```

### Coming Soon ✈️

Flight search is planned but not yet implemented. Hotel booking is the current focus.

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

**Current Focus**: 🏨 Hotel Search  
**Current Sprint**: Foundation & Infrastructure (Epic 1)  
**Next Sprint**: Hotel Search (Epic 2)

See [GitHub Projects](https://github.com/stofancy/booking-com-automation/projects) for roadmap.

### Roadmap

- [x] Sprint 1: Foundation & Infrastructure (In Progress)
- [ ] Sprint 2: Hotel Search (Next)
- [ ] Sprint 3: Browser Automation (Core)
- [ ] Sprint 4: UX & Polish
- [ ] Sprint 5: Testing & QA
- [ ] Sprint 6: Publishing

### Coming Later

- ✈️ Flight search (deferred - low priority)
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
