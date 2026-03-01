# Technical Reference - Compressed

**Purpose**: Quick technical reference for maintenance

---

## 🔧 Selectors (Live Verified 2026-03-01)

### Homepage
```
Destination: combobox "Where are you going?" [ref=e92]
Dates: button "Check-in date — Check-out date" [ref=e96]
Guests: button "Number of travelers..." [ref=e106]
Search: button "Search" [ref=e115]
```

### Property Cards
```
Name: heading "[Hotel Name]" [level=3]
Rating: generic "[9.2]"
Category: generic "Wonderful"
Reviews: generic "[1,494] reviews"
Price: CNY [amount]
```

### Property Details
```
Name: heading "[Hotel Name]" [level=2]
Stars: button "[4] out of 5 stars"
Score: generic "[9.2]"
Reviews: generic "· [1,493] reviews"
Address: button "[Address]"
```

### Rooms
```
Table: table "Select a room type"
Room: link "[Room Name]"
Beds: radio "[1 queen bed]"
Price: generic "CNY [amount]"
Select: combobox "Select Rooms"
```

### Guest Form
```
First Name: combobox "First name"
Last Name: combobox "Last name"
Email: combobox "Email address"
Phone: combobox "Phone number"
Country: combobox "Country"
```

### Payment
```
Summary: "Booking summary"
Total: "Total: [CNY amount]"
Methods: "Credit card", "PayPal", etc.
Complete: button "Complete booking"
```

---

## 🧪 Test Patterns

### Property Name Extraction
```javascript
const match = snapshot.match(/heading "([^"]+)" \[level=2\]/i);
// Returns: "Relais Hôtel du Vieux Paris"
```

### Rating Extraction
```javascript
const match = snapshot.match(/generic "(\d\.\d)"/);
// Returns: 9.2
```

### Review Count
```javascript
const match = snapshot.match(/·\s*([\d,]+)\s*reviews/i);
// Returns: 1493
```

### Price Extraction
```javascript
const match = snapshot.match(/CNY ([\d,]+)/);
// Returns: 2172
```

---

## 🔍 Error Patterns

### Common Issues
1. **Selector changes**: Update regex patterns
2. **Date format**: Use YYYY-MM-DD
3. **Currency**: Handle CNY, USD, EUR
4. **Pagination**: Check for "Next page" buttons

### Debug Commands
```bash
# Run specific test
node --test tests/unit/property-details.test.js

# Validate selectors
node scripts/validate-skill.js

# Test on live site
node tests/smoke-test.js
```

---

## 📦 Module Exports

### search-parser.js
```javascript
parseSearchQuery(query) → {destination, checkIn, checkOut, adults, children, rooms, budget}
```

### property-details.js
```javascript
extractPropertyDetails(browser) → {name, starRating, guestScore, reviewCount, amenities, ...}
```

### decision-support.js
```javascript
createDecisionSummary(property, rooms) → {overallScore, keyFeatures, concerns, recommendation}
formatDecisionSummary(summary) → String
```

### guest-details.js
```javascript
extractGuestForm(browser) → {fields, requiredFields, optionalFields}
fillGuestDetails(browser, guestData) → {success, filledFields, errors}
```

### payment-handoff.js
```javascript
navigateToPayment(browser) → {onPaymentPage, bookingSummary, totalPrice}
handoffToUser(paymentInfo) → {success, message, summary}
waitForConfirmation(browser) → {confirmed, confirmation}
```

---

## 🚨 Troubleshooting

### Tests Failing
1. Check snapshot format changed
2. Update regex patterns
3. Verify ARIA refs still valid

### Selectors Not Found
1. Run browser snapshot
2. Compare with expected refs
3. Update patterns in scripts/

### Live Site Changes
1. Check booking.com UI update
2. Re-verify all selectors
3. Update extraction patterns
4. Re-run all tests

---

## 📊 Performance Benchmarks

| Operation | Target | Actual |
|-----------|--------|--------|
| Search | <5s | ~3s |
| Property Extract | <3s | ~2s |
| Room Extract | <3s | ~2s |
| Guest Fill | <5s | ~4s |
| Total Flow | <30s | ~20s |

---

## 🔐 Security Notes

- ❌ Never store payment info
- ✅ User completes payment manually
- ✅ No credentials hardcoded
- ✅ Respect rate limits
- ✅ Follow robots.txt

---

**Last Updated**: 2026-03-01 22:10 GMT+8  
**Version**: 1.0.0
