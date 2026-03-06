# E2E Tests for Booking.com Automation

This directory contains end-to-end tests that verify the skill works correctly by invoking the OpenClaw agent.

## ⚠️ Important: Local Testing Only

**These tests are designed for LOCAL execution only and will NOT run in CI/CD environments.**

This is because:
1. E2E tests require the OpenClaw CLI and a running agent
2. Tests interact with real booking.com website
3. Requires network access and browser automation

## Prerequisites

1. **OpenClaw CLI installed**
   ```bash
   npm install -g openclaw
   ```

2. **Playwright browsers installed**
   ```bash
   npx playwright install chromium
   ```

3. **OpenClaw agent running** with the skill loaded
   ```bash
   openclaw agents list
   ```

## Running Tests

### Quick Start (uses default settings)
```bash
npm run test:e2e
```

### Custom Test Run
```bash
# Test with specific agent
npm run test:e2e -- --agent travel-agency

# Test with specific destination
npm run test:e2e -- --destination "Paris" --checkin 2026-05-01 --checkout 2026-05-05

# Test with longer timeout
npm run test:e2e -- --timeout 300
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENCLAW_AGENT_ID` | `travel-agency` | Agent ID to use |
| `OPENCLAW_TIMEOUT` | `180` | Timeout in seconds |
| `CI` or `NODE_ENV=ci` | - | If set, tests are skipped |

## How It Works

1. **Invokes OpenClaw CLI** - Spawns `openclaw agent` command
2. **Sends search request** - Message with destination and dates
3. **Verifies skill usage** - Checks output contains skill-related messages
4. **Verifies success** - Checks search completed successfully

## Test Cases

The default test suite runs 3 scenarios:
- Paris (May 1-5, 2026)
- Tokyo (April 10-15, 2026)
- London (June 1-3, 2026)

## Troubleshooting

### "Command not found: openclaw"
Ensure OpenClaw is installed:
```bash
npm install -g openclaw
```

### "Timeout" errors
Increase timeout:
```bash
npm run test:e2e -- --timeout 300
```

### Tests skipped in CI
This is expected - E2E tests are local-only by design.
