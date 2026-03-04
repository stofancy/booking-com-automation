# Booking.com Automation Skill for OpenClaw

🤖 An OpenClaw skill for automating hotel searches and booking on booking.com

## Status

✅ **Production Ready** - All 6 sprints complete (360 tests passing)

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
- **Testing**: Unit tests + integration tests with mock data

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
│   ├── unit/
│   └── integration/
├── .github/workflows/       # CI/CD pipelines
└── references/              # Documentation (placeholder)
```

## Progress

See [GitHub Issues](https://github.com/stofancy/booking-com-automation/issues) for completed sprints and roadmap.

## License

MIT

## Author

Developed for the OpenClaw community

---

**Note**: This skill requires:
- OpenClaw installed with browser tooling
- Chrome extension relay configured
- Active booking.com session (login manually first)
