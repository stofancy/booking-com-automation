---
name: booking-com-automation
description: Automate flight and hotel searches on booking.com. Use when: (1) searching for flights between cities, (2) searching for hotels in a destination, (3) comparing prices across dates, (4) finding travel options within budget. NOT for: completing bookings (manual confirmation required), managing existing reservations, or non-booking.com travel sites.
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

- Searching for flights between two cities
- Searching for hotels in a destination
- Comparing prices across different dates
- Finding travel options within a budget
- Getting quick summaries of top 3-5 options

❌ **DON'T use this skill when:**

- Completing actual bookings (requires manual confirmation)
- Managing or modifying existing reservations
- Searching on other travel sites (Expedia, Kayak, etc.)
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

### Flight Search

```
Find flights from New York to London, March 15-22, 2 passengers
```

```
Search flights JFK to PAR, departing April 1, returning April 8, economy class
```

```
Cheapest flights from San Francisco to Tokyo in May, flexible dates +/- 3 days
```

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

### Flexible Date Search

```
Flights from LA to Miami, flexible dates in June, show cheapest options
```

```
Hotels in Rome, weekend in March, compare prices across weekends
```

## Output Format

The skill returns text summaries with 3-5 options:

### Flight Example

```
✈️ Found 5 flights from JFK to LHR (March 15-22, 2026):

1. British Airways BA112 - $687
   Depart: 10:30 PM → Arrive: 10:25 AM+1 (7h 55m, nonstop)
   Return: BA113 - 6:00 PM → 8:50 PM (8h 50m, nonstop)
   [Book on booking.com](https://booking.com/...)

2. Virgin Atlantic VS4 - $712
   Depart: 8:00 PM → Arrive: 8:00 AM+1 (7h 00m, nonstop)
   Return: VS3 - 11:30 AM → 2:30 PM (8h 00m, nonstop)
   [Book on booking.com](https://booking.com/...)

3. American Airlines AA100 - $745
   Depart: 6:30 PM → Arrive: 6:45 AM+1 (8h 15m, nonstop)
   Return: AA101 - 4:15 PM → 7:20 PM (9h 05m, nonstop)
   [Book on booking.com](https://booking.com/...)

... (2 more options)

💡 Best value: Option 1 (British Airways) - lowest price with good timing
```

### Hotel Example

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

**Flights:**
- Cabin class (economy, premium, business, first)
- Number of stops (nonstop, 1 stop, any)
- Airlines (specific carriers)
- Departure/arrival time windows

**Hotels:**
- Star rating (1-5 stars)
- Guest rating (minimum score)
- Price range (min-max per night)
- Amenities (WiFi, pool, gym, parking, etc.)
- Distance from city center

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

Current sprint: Foundation & Infrastructure (Epic 1)

See [GitHub Projects](https://github.com/stofancy/booking-com-automation/projects) for roadmap.

### Implemented Features

- [ ] Flight search
- [ ] Hotel search
- [ ] Date flexibility
- [ ] Price comparison
- [ ] Filter support

### Coming Soon

- [ ] Multi-city flight search
- [ ] Package deals (flight + hotel)
- [ ] Price alerts
- [ ] Booking history access

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
