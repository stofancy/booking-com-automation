---
name: booking-com-automation
description: Automate hotel booking searches on booking.com. Use OpenClaw's browser tool for automation.
metadata: {"openclaw": {"requires": {"config": ["browser.enabled"], "bins": ["node"]}, "emoji": "🏨"}}
---

# Booking.com Automation Skill

Automate hotel searches on booking.com using OpenClaw's browser tool.

## When AI Agent Should Use This Skill

**USE this skill when:**
- User wants to search for hotels in a specific destination
- User wants to find accommodations within a date range
- User wants to compare hotel prices and options

**DON'T use this skill when:**
- User wants flight search (not supported)
- User wants car rental (not supported)
- User wants to complete actual payment (manual)

## OpenClaw Integration

This skill uses OpenClaw's built-in `browser` tool. No additional setup required - OpenClaw manages the browser automatically.

### For OpenClaw Users

The skill automatically receives a browser page from OpenClaw. Simply call:

```javascript
const { run } = require('./index.js');

const result = await run({
  destination: 'Paris',
  checkIn: '2026-03-15',
  checkOut: '2026-03-20',
  adults: 2
});
```

### For CLI Testing

```bash
# Requires Chrome with remote debugging enabled on port 9222
node index.js --destination "Paris" --checkin 2026-03-15 --checkout 2026-03-20
```

## How AI Agent Should Use This Skill

### Step 1: Parse User Request

Extract parameters from natural language:

| Parameter | Example |
|-----------|---------|
| `destination` | "Paris" from "Hotels in Paris" |
| `checkIn` | "2026-03-15" from "March 15" |
| `checkOut` | "2026-03-20" from "March 15-20" |
| `adults` | 2 from "2 guests" (default: 2) |
| `children` | 0 from no mention (default: 0) |
| `rooms` | 1 from no mention (default: 1) |

### Step 2: Call the Skill

```javascript
const { run } = require('./index.js');

const result = await run({
  destination: 'Paris',
  checkIn: '2026-03-15',
  checkOut: '2026-03-20',
  adults: 2
});
```

### Step 3: Handle Result

```javascript
if (result.success) {
  // result.data.url - search results URL to show user
  // result.data.page - Browser page for further automation
  console.log('Results:', result.data.url);
}
```

## Full Booking Flow

The booking process has multiple stages. Currently this skill handles **Search**:

```
┌─────────────────────────────────────────────────────────────┐
│  Search (run)                                              │
│  destination + dates + guests → booking.com search results  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Future stages (not yet implemented):                      │
│                                                              │
│  Property Selection → Choose from results                   │
│         ↓                                                   │
│  Property Details → View hotel info                         │
│         ↓                                                   │
│  Room Extraction → Get room options                         │
│         ↓                                                   │
│  Rate Comparison → Compare prices                           │
│         ↓                                                   │
│  Room Selection → Select room                              │
│         ↓                                                   │
│  Guest Details → Fill guest info                           │
│         ↓                                                   │
│  Payment → User completes manually                         │
└─────────────────────────────────────────────────────────────┘
```

For now, this skill focuses on **Search only**. The agent should:
1. Call `run()` to get search results
2. Present the URL to user
3. User can then browse and book manually

## Setup

### Prerequisites

1. **Node.js** >= 18.0.0
2. **OpenClaw** with browser enabled
3. **booking.com account** with active login (manual)

### Installation

```bash
npm install
```

### Browser Configuration

OpenClaw manages the browser. Configure in `~/.openclaw/openclaw.json`:

```json
{
  "browser": {
    "enabled": true,
    "defaultProfile": "openclaw"
  }
}
```

For existing login sessions, use `profile="user"`:
```json
{
  "browser": {
    "defaultProfile": "user"
  }
}
```

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| destination | string | yes | - | City name |
| checkIn | string | yes | - | YYYY-MM-DD |
| checkOut | string | yes | - | YYYY-MM-DD |
| adults | number | no | 2 | Guest count |
| children | number | no | 0 | Child count |
| rooms | number | no | 1 | Room count |

## Returns

```javascript
{
  success: true,
  message: "Search completed: Paris (2026-03-15 to 2026-03-20)",
  data: {
    searchParams: { destination, checkIn, checkOut, ... },
    url: "https://www.booking.com/searchresults.html?...",
    page: <Browser Page object>
  }
}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Browser disabled" | Enable browser in OpenClaw config |
| "Timeout" errors | Check network connection |
| Login required | User logs in manually first, or use `profile="user"` |

---

**Version:** 1.2.0
**Last Updated:** 2026-03-20
**Author:** stofancy
