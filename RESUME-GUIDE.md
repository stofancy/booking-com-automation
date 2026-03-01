# Resume Guide - Quick Start

**Purpose**: Resume work after session pause

---

## 🚀 Quick Resume (3 Steps)

### Step 1: Verify Status
```bash
cd ~/.openclaw/workspace/skills/booking-com-automation
npm test
```
Expected: 360 passing, 0 failing

### Step 2: Complete Publication
```bash
clawhub login
# Follow browser prompts to authenticate
clawhub publish . --slug booking-com-automation
```

### Step 3: Verify Publication
```bash
clawhub list
# Should show booking-com-automation v1.0.0
```

---

## 📁 Key Files to Review

| File | When to Read |
|------|--------------|
| SESSION-SUMMARY.md | First - complete overview |
| PROJECT-STATUS.md | Details - full project status |
| TECHNICAL-REFERENCE.md | Maintenance - selectors & patterns |

---

## 🔧 Common Tasks

### Run Tests
```bash
npm test
```

### Fix Failing Test
1. Read test file in `tests/unit/`
2. Check selector pattern
3. Update regex if needed
4. Re-run test

### Update Selectors
1. Open booking.com in Chrome
2. Run: `browser snapshot --profile chrome`
3. Compare refs with TECHNICAL-REFERENCE.md
4. Update patterns in scripts/

### Add New Feature
1. Create script in `scripts/`
2. Add tests in `tests/unit/`
3. Update SKILL.md
4. Run: `npm test && npm run validate`

---

## 🚨 Troubleshooting

### Tests Failing
- Check if booking.com UI changed
- Compare live selectors with patterns
- Update regex in affected script

### Publication Failed
- Verify `clawhub login` completed
- Check package exists: `ls dist/`
- Re-run: `npm run package`

### Selectors Not Found
- Run live snapshot
- Update TECHNICAL-REFERENCE.md
- Update script patterns

---

## 📞 Support

**Repository**: https://github.com/stofancy/booking-com-automation  
**Docs**: See `/docs` folder  
**Tests**: `npm test`  
**Validate**: `npm run validate`

---

**Last Updated**: 2026-03-01 22:21 GMT+8  
**Version**: 1.0.0
