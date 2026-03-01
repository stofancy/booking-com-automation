# Booking.com Automation Skill for OpenClaw

🤖 An OpenClaw skill for automating flight and hotel searches on booking.com

## Status

🚧 **Under Active Development** - Following Agile/Kanban methodology

## Features (Planned)

- ✈️ Flight search automation
- 🏨 Hotel search automation  
- 💰 Price comparison across dates
- 📊 Text summaries with top 3-5 options
- 🔐 Works with existing booking.com login session
- 🌐 Chrome extension relay for fast browser automation

## Installation (Coming Soon)

```bash
# Via clawhub (when published)
clawhub install booking-com-automation
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
├── scripts/                 # Automation scripts
│   ├── search-flights.js
│   ├── search-hotels.js
│   └── extract-results.js
├── references/              # Documentation & selectors
│   ├── booking-selectors.md
│   └── troubleshooting.md
├── tests/                   # Test suites
│   ├── unit/
│   └── integration/
├── .github/workflows/       # CI/CD pipelines
└── package.json
```

## Roadmap

See [GitHub Projects](https://github.com/stofancy/booking-com-automation/projects) for current sprint and backlog.

## License

MIT

## Author

Developed for the OpenClaw community

---

**Note**: This skill requires:
- OpenClaw installed with browser tooling
- Chrome extension relay configured
- Active booking.com session (login manually first)
