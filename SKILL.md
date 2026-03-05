---
name: booking-com-automation
description: Automate hotel booking searches on booking.com using Playwright browser automation.
argument-hint: destination: string, checkIn: string (YYYY-MM-DD), checkOut: string (YYYY-MM-DD), adults?: number, children?: number, rooms?: number, headless?: boolean
---

# Booking.com Automation Skill

Automate hotel searches on booking.com using Playwright browser automation.

## When AI Agent Should Use This Skill

**USE this skill when:**
- User wants to search for hotels in a specific destination
- User wants to find accommodations within a date range
- User wants to compare hotel prices and options

**DON'T use this skill when:**
- User wants flight search (not supported)
- User wants car rental (not supported)
- User wants to complete actual payment (manual)

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
  adults: 2,
  headless: true
});
```

### Step 3: Handle Result

```javascript
if (result.success) {
  // result.data.url - search results URL to show user
  // result.data.page - Playwright page for further automation
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
│  Future stages (not yet implemented with Playwright):      │
│                                                              │
│  Property Selection → Choose from results                   │
│         ↓                                                   │
│  Property Details → View hotel info                         │
│         ↓                                                   │
│  Room Extraction → Get room options                        │
│         ↓                                                   │
│  Rate Comparison → Compare prices                          │
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

Future updates may add full booking automation.

## Setup

### Prerequisites

1. **Node.js** >= 18.0.0
2. **Playwright** installed (`npm install playwright`)
3. **booking.com account** with active login (manual)

### Installation

```bash
npm install
npx playwright install chromium
```

### Running

```bash
# Headless mode
node index.js --destination Paris --checkin 2026-03-15 --checkout 2026-03-20

# Visible browser
node index.js --destination Tokyo --headless false
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
| headless | boolean | no | true | Browser mode |

## Returns

```javascript
{
  success: true,
  message: "Search completed: Paris (2026-03-15 to 2026-03-20)",
  data: {
    searchParams: { destination, checkIn, checkOut, ... },
    url: "https://www.booking.com/searchresults.html?...",
    page: <Playwright Page object>
  }
}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Executable doesn't exist" | Run `npx playwright install chromium` |
| "Timeout" errors | Try `headless: false` to debug |
| Login required | User logs in manually first |

---

**Version:** 1.1.0
**Last Updated:** 2026-03-06
**Author:** stofancy
