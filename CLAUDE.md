# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Node.js OpenClaw skill for automating hotel booking searches on booking.com. It uses Playwright for browser automation and plain JavaScript (CommonJS modules) with the Node.js native test runner.

## Commands

```bash
# Run all unit tests
npm test

# Run a single test file
node --test tests/unit/search-form.test.js

# Run E2E tests (requires booking.com session)
npm run test:e2e

# Run tests with coverage
npm run test:coverage

# Validate skill structure
npm run validate

# Package the skill for release
npm run package

# Deploy packaged skill
npm run deploy

# Package and deploy in one command
npm run deploy:package
```

## Architecture

The skill follows a **modular pipeline architecture** where each script in `scripts/` handles a specific step in the booking flow:

```
query → search-form → results-extractor → results-presenter
                                            ↓
                                    property-selector
                                            ↓
                                    property-details
                                            ↓
                                    room-extractor
                                            ↓
                                    rate-comparison
                                            ↓
                                    room-selection
                                            ↓
                                    guest-details
                                            ↓
                                    payment-handoff → User completes payment
```

### Entry Point (`index.js`)

- Exports `run()` function as the main skill entry point
- Accepts parameters: `{ destination, checkIn, checkOut, adults, children, rooms, page, headless }`
- Returns standardized response: `{ success: true/false, message, data, error }`
- If `page` is provided, uses external browser/page; otherwise launches Playwright browser

### Browser Automation

The skill uses **Playwright** (not Chrome extension relay) for browser automation:

- **Headless mode** (default): `headless: false` in index.js can be toggled
- **External page**: Accepts a `page` object for integration with external browser contexts
- **GUI mode**: Run with `--headless false` in CLI or set `headless: false` programmatically to see the browser

### Module Pattern

Each script in `scripts/` follows this structure:

```javascript
#!/usr/bin/env node

/**
 * Module description
 */

const path = require('path');
// Other imports...

// Constants at module level
const CONSTANT_VALUE = 'value';

/**
 * Function description
 * @param {Type} paramName - Parameter description
 * @returns {Type} Return description
 */
function functionName(paramName) {
  // Implementation
}

// Export functions
module.exports = {
  functionName,
};
```

## Key Conventions

- **File naming**: `kebab-case.js`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Test files**: Must end with `.test.js` in `tests/unit/`
- **Response format**: Always return `{ success: boolean, message?: string, data?: object, error?: string }`
- **Date format**: `YYYY-MM-DD`
- **Strings**: Single quotes, template literals for interpolation
- **Error handling**: Return error objects with `error` (type), `message` (user-friendly), and optional `data`

## Prerequisites

- Node.js >= 18.0.0
- OpenClaw with browser tooling
- Playwright browsers installed (chromium is used by default)
- Active booking.com session (manual login required)

## Testing

- Uses Node.js native `node:test` module
- Test files import modules directly: `require('../../scripts/module.js')`
- Assert with `require('assert')`
- E2E tests require a logged-in booking.com session
