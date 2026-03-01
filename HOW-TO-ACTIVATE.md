# How to Activate & Test Booking.com Automation Skill

**Status**: ✅ Installed Locally  
**Location**: `~/.nvm/versions/node/v24.14.0/lib/node_modules/openclaw/skills/booking-com-automation`

---

## ✅ Installation Complete

The skill has been installed in your OpenClaw skills directory.

---

## 🎯 How to Activate

### Method 1: Natural Language (Recommended)

Just use natural language in your chat:

**Examples**:
```
"Find hotels in Paris, March 15-20, 2 guests"
"Search for cheap hotels in Barcelona under $200/night"
"Show me hotels in Tokyo next weekend"
"Find a hotel in London with free cancellation"
```

The skill will automatically activate when it detects:
- Hotel search queries
- Destination + dates
- Budget constraints
- Booking-related requests

---

### Method 2: Direct Command

If you have OpenClaw CLI:

```bash
openclaw skill use booking-com-automation
```

Then start chatting:
```
Search for hotels in Paris
```

---

### Method 3: Browser Automation

For advanced users, use the scripts directly:

```bash
cd ~/.nvm/versions/node/v24.14.0/lib/node_modules/openclaw/skills/booking-com-automation

# Test search parser
node scripts/search-parser.js "Hotels in Paris, March 15-20, 2 guests"

# Test property details (requires browser)
node -e "const {extractPropertyDetails} = require('./scripts/property-details.js'); console.log('Ready')"

# Test decision support
node -e "const {createDecisionSummary} = require('./scripts/decision-support.js'); console.log('Ready')"
```

---

## 🧪 Testing the Skill

### Test 1: Search Parser
```bash
cd ~/.nvm/versions/node/v24.14.0/lib/node_modules/openclaw/skills/booking-com-automation
node scripts/search-parser.js "Hotels in Paris, March 15-20, 2 guests"
```

Expected output:
```json
{
  "destination": "paris",
  "checkIn": "2026-03-15",
  "checkOut": "2026-03-20",
  "adults": 2,
  "children": 0,
  "rooms": 1,
  "valid": true
}
```

### Test 2: Run All Tests
```bash
npm test
```

Expected: 360 passing, 0 failing

### Test 3: Live Search (Manual)
1. Open Chrome with booking.com
2. Click Browser Relay extension
3. In OpenClaw chat, say:
   ```
   Find hotels in Paris for March 15-20, 2 guests
   ```
4. Skill should activate and start search

---

## 🔍 How Skill Activation Works

The skill auto-activates when your query matches:

### Trigger Patterns
- "hotels in [city]"
- "find a hotel in [city]"
- "search for hotels"
- "book a hotel"
- "[city] hotels"
- "accommodation in [city]"

### Date Patterns
- "March 15-20"
- "next weekend"
- "tomorrow"
- "2026-03-15 to 2026-03-20"

### Guest Patterns
- "2 guests"
- "2 adults"
- "2 adults and 1 child"
- "for 2 people"

### Budget Patterns
- "under $200"
- "cheap hotels"
- "budget hotels"
- "less than $200/night"

---

## 🚨 Troubleshooting

### Skill Not Activating

**Check**:
1. Skill is installed:
   ```bash
   ls ~/.nvm/versions/node/v24.14.0/lib/node_modules/openclaw/skills/booking-com-automation
   ```

2. SKILL.md exists:
   ```bash
   cat ~/.nvm/versions/node/v24.14.0/lib/node_modules/openclaw/skills/booking-com-automation/SKILL.md
   ```

3. Restart OpenClaw:
   ```bash
   openclaw restart
   ```

### Tests Failing

**Fix**:
```bash
cd ~/.nvm/versions/node/v24.14.0/lib/node_modules/openclaw/skills/booking-com-automation
npm test
```

If tests fail, check:
- Node.js version (need 18+)
- Dependencies installed
- Selectors match live site

### Browser Not Connecting

**Fix**:
1. Open Chrome
2. Go to booking.com
3. Click Browser Relay extension icon
4. Ensure badge turns green/active
5. Retry in OpenClaw

---

## 📊 Skill Capabilities

### What It Can Do
✅ Search for hotels by destination
✅ Parse natural language queries
✅ Extract property details
✅ Compare room rates
✅ Fill guest details form
✅ Navigate to payment page
✅ Provide recommendations

### What It Can't Do (By Design)
❌ Complete payment (security - user does this)
❌ Store payment information
❌ Modify existing bookings
❌ Cancel bookings
❌ Search flights (not yet implemented)

---

## 🎯 Example Usage Flow

### User: 
```
Find hotels in Paris, March 15-20, 2 guests, under $200/night
```

### Skill Activation:
1. ✅ Detects "hotels in Paris" → Search trigger
2. ✅ Parses dates "March 15-20" → 2026-03-15 to 2026-03-20
3. ✅ Parses guests "2 guests" → 2 adults
4. ✅ Parses budget "under $200/night" → maxPrice: 200
5. ✅ Activates booking-com-automation skill
6. ✅ Opens browser to booking.com
7. ✅ Fills search form
8. ✅ Extracts results
9. ✅ Presents top 5 options with recommendations

### Skill Response:
```
🏨 Found 5 hotels in Paris (March 15-20, 2 guests):

1. Hôtel Jardin de Cluny - $217/night ⭐ 9.1 Wonderful
   Location: 0.8km from center
   🥐 Breakfast included
   ✅ Free cancellation
   [Book on booking.com](link)

2. Hotel Verneuil Saint Germain - $226/night ⭐ 8.4 Very Good
   Location: 1.5km from center
   ✅ Free cancellation
   [Book on booking.com](link)

... (3 more options)

💡 Best value: Option 1 (Hôtel Jardin de Cluny)
   Highest rating with free cancellation

What would you like to do?
1. Book this hotel
2. See more details
3. Compare with other options
4. Search different location
```

---

## 📞 Support

**Skill Location**: 
```
~/.nvm/versions/node/v24.14.0/lib/node_modules/openclaw/skills/booking-com-automation
```

**Documentation**:
- See SESSION-SUMMARY.md for complete overview
- See TECHNICAL-REFERENCE.md for selectors
- See RESUME-GUIDE.md for quick start

**Tests**:
```bash
cd ~/.nvm/versions/node/v24.14.0/lib/node_modules/openclaw/skills/booking-com-automation
npm test
```

---

## ✅ Activation Checklist

- [x] Skill installed
- [x] SKILL.md in place
- [x] Tests passing
- [ ] Browser Relay extension installed
- [ ] Chrome open with booking.com
- [ ] Ready to test!

---

**Ready to test! Just start chatting with hotel search queries.** 🎉
