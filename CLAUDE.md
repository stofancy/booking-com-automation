# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Node.js OpenClaw skill for automating hotel booking searches on booking.com. It uses plain JavaScript (CommonJS modules) with the Node.js native test runner.

## Commands

```bash
# Run all unit tests
npm test

# Run a single test file
node --test tests/unit/search-parser.test.js

# Run tests with coverage
npm run test:coverage

# Run linter/validation
npm run lint

# Package the skill for release
npm run package

# Test the search parser directly
npm run parser:test
```

## Architecture

The skill follows a **modular pipeline architecture** where each script in `scripts/` handles a specific step in the booking flow:

```
query → searchParser → searchForm → resultsExtractor → resultsPresenter
                                                      ↓
                                              propertySelector
                                                      ↓
                                              propertyDetails
                                                      ↓
                                              roomExtractor
                                                      ↓
                                              rateComparison
                                                      ↓
                                              roomSelection
                                                      ↓
                                              guestDetails
                                                      ↓
                                              paymentHandoff → User completes payment
```

### Entry Point (`index.js`)

- Exports `run()` function as the main skill entry point
- Accepts `{ query, browser, context }` parameters
- Returns standardized response: `{ success: true/false, message, data, error }`
- If no browser context provided, returns parsed search params without executing automation

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
- **Date format**: `YYYY-MM-DD` (use the `formatDate()` helper)
- **Strings**: Single quotes, template literals for interpolation
- **Error handling**: Return error objects with `error` (type), `message` (user-friendly), and optional `data`

## Prerequisites

- Node.js >= 18.0.0
- OpenClaw with browser tooling
- Chrome extension relay configured
- Active booking.com session (manual login required)

## Testing

- Uses Node.js native `node:test` module
- Test files import modules directly: `require('../../scripts/module.js')`
- Assert with `require('assert')`
