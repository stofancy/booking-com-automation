# Booking.com Automation Skill for OpenClaw

🤖 An OpenClaw skill for automating hotel searches and booking on booking.com

## Status

✅ **Production Ready** - All 6 sprints complete (204 tests passing)

## Features

- 🏨 Hotel search automation  
- 💰 Price comparison across dates
- 📊 Text summaries with top 3-5 options
- 🔐 Works with existing booking.com login session
- 🌐 Chrome extension relay for fast browser automation

## Installation

```bash
# Via clawhub (recommended)
clawhub install booking-com-automation

# Or clone and use directly
git clone git@github.com:stofancy/booking-com-automation.git
cd booking-com-automation
npm install
```

## Development

This project is developed using Agile/Kanban methodology:

- **Project Board**: GitHub Projects (Kanban style)
- **Issues**: Tracked with epics, user stories, and tasks
- **CI/CD**: GitHub Actions for testing and packaging
- **Testing**: Unit tests

### Quick Start

```bash
# Clone the repository
git clone git@github.com:stofancy/booking-com-automation.git
cd booking-com-automation

# Install dependencies
npm install

# Run tests
npm test

# Run linter
npm run lint
```

### Project Structure

```
booking-com-automation/
├── SKILL.md                 # OpenClaw skill definition
├── index.js                 # Skill entry point
├── plugin.json              # Plugin declaration
├── package.json             # Package configuration
├── scripts/                 # Automation modules
│   ├── search-parser.js
│   ├── search-form.js
│   ├── results-extractor.js
│   ├── results-presenter.js
│   ├── property-selector.js
│   ├── property-details.js
│   ├── decision-support.js
│   ├── room-extractor.js
│   ├── rate-comparison.js
│   ├── room-selection.js
│   ├── guest-details.js
│   └── payment-handoff.js
├── tests/                   # Test suites
│   └── unit/
├── .github/workflows/       # CI/CD pipelines
└── references/              # Documentation (placeholder)
```

## Progress

See [GitHub Issues](https://github.com/stofancy/booking-com-automation/issues) for completed sprints and roadmap.

## Development Status

### Completed Sprints

| Sprint | Feature | Status |
|--------|---------|--------|
| Sprint 1 | Foundation & Infrastructure | ✅ Complete |
| Sprint 2 | Hotel Search | ✅ Complete |
| Sprint 3 | Property Selection & Details | ✅ Complete |
| Sprint 4 | Room Selection | ✅ Complete |
| Sprint 5 | Guest Details Form | ✅ Complete |
| Sprint 6 | Payment Page Handoff | ✅ Complete |

### MVP vs Full Booking

- **MVP (Search Only)**: Sprints 1-3 - Search and present hotel options
- **Full Booking**: Sprints 1-6 - Complete booking to payment page

### Coming Later

- ✈️ Flight search (deferred - hotel booking first)
- 📦 Package deals (flight + hotel)
- 🔔 Price alerts
- 📋 Booking history access

## Troubleshooting

### Common Issues

| Error | Cause | Solution |
|-------|-------|----------|
| "Not logged in" | No active booking.com session | Log in to booking.com in Chrome |
| "No results found" | No matches for criteria | Try different dates or relax filters |
| "Search timeout" | Slow page load | Retry, check internet connection |
| "Cannot parse results" | booking.com layout changed | Report issue, skill needs update |

### Skill Not Triggering

Ensure the skill description matches your query. Try:
- "Search hotels..."
- "Find hotels..."
- "Book a hotel..."

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

Found a bug or want to contribute? See [CONTRIBUTING.md](CONTRIBUTING.md)

## License

MIT License - See [LICENSE](LICENSE)

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-04 | Production release with full booking flow |
| 0.1.0 | 2026-03-01 | Initial development |

## Author

Developed for the OpenClaw community

---

**Note**: This skill requires:
- OpenClaw installed with browser tooling
- Chrome extension relay configured
- Active booking.com session (login manually first)
