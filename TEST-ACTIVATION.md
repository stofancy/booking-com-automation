# Test Skill Activation

**Quick test to verify skill is working**

---

## ✅ Installation Verified

**Location**: `~/.nvm/versions/node/v24.14.0/lib/node_modules/openclaw/skills/booking-com-automation`

**SKILL.md**: ✅ Present and valid

---

## 🧪 Quick Activation Test

### Test 1: Parser Test (Offline)
```bash
cd ~/.nvm/versions/node/v24.14.0/lib/node_modules/openclaw/skills/booking-com-automation
node scripts/search-parser.js "Hotels in Paris, March 15-20, 2 guests"
```

**Expected**: Valid JSON with destination, dates, guests

### Test 2: Chat Test (Online)

In your OpenClaw chat, type:
```
Find hotels in Paris for March 15-20, 2 guests
```

**Expected**: Skill activates and responds with search options

### Test 3: Browser Test (Full Flow)

1. Open Chrome
2. Go to booking.com
3. Click Browser Relay extension (ensure active)
4. In OpenClaw chat, type:
   ```
   Search for cheap hotels in Barcelona under $200/night
   ```

**Expected**: 
- Skill activates
- Browser automation starts
- Search form fills
- Results extracted
- Top 5 presented

---

## 🎯 Activation Triggers

The skill activates when you say:

### ✅ Works:
- "Hotels in Paris"
- "Find a hotel in Tokyo"
- "Search for cheap hotels"
- "Book accommodation in London"
- "Show me hotels in Barcelona"
- "I need a hotel in New York"

### ❌ Won't Activate:
- "What's the weather?"
- "Book a flight" (not implemented yet)
- "Cancel my booking" (not supported)

---

## 📊 Skill Response Format

When activated, skill responds with:

```
🏨 Found X hotels in [City] ([Dates], [Guests]):

1. [Hotel Name] - $[Price]/night ⭐ [Rating] [Category]
   Location: [Distance] from center
   [Amenities]
   [Cancellation policy]
   [Booking link]

2. ... (more options)

💡 Best value: Option X ([Hotel Name])
   [Reason]

What would you like to do?
1. Book this hotel
2. See more details
3. Compare with other options
4. Search different location
```

---

## 🚨 If Skill Doesn't Activate

### Check 1: Installation
```bash
ls -la ~/.nvm/versions/node/v24.14.0/lib/node_modules/openclaw/skills/ | grep booking
```
Should show: `booking-com-automation`

### Check 2: SKILL.md
```bash
cat ~/.nvm/versions/node/v24.14.0/lib/node_modules/openclaw/skills/booking-com-automation/SKILL.md | head -5
```
Should show YAML frontmatter with `name: booking-com-automation`

### Check 3: Restart OpenClaw
```bash
openclaw restart
```

### Check 4: Test Parser
```bash
cd ~/.nvm/versions/node/v24.14.0/lib/node_modules/openclaw/skills/booking-com-automation
node scripts/search-parser.js "test"
```
Should run without errors

---

## ✅ Success Indicators

Skill is working when you see:
- ✅ Parser extracts destination, dates, guests
- ✅ Browser opens booking.com (if online test)
- ✅ Search form fills automatically
- ✅ Results presented with ratings and prices
- ✅ Recommendations provided

---

## 📞 Quick Help

**Skill installed**: YES  
**Location**: `~/.nvm/versions/node/v24.14.0/lib/node_modules/openclaw/skills/booking-com-automation`  
**Tests**: `npm test` (should show 360 passing)  
**Parser test**: `node scripts/search-parser.js "Hotels in Paris"`  

---

**Ready to test! Type a hotel search query to activate.** 🎯
