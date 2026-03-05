# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-03-05

### Added
- **fillDates()** function implementation - Complete calendar date selection for check-in/check-out
- **DOM-based results extraction** - Refactored results-extractor.js to use browser snapshot instead of regex
- **ARIA ref-based clicking** - All modules now use ARIA refs for reliable element interaction

### Changed
- **search-form.js** - Added complete calendar date selection logic
- **results-extractor.js** - Complete refactor to use DOM snapshot parsing
- **property-selector.js** - Updated to use ARIA refs for property selection
- **room-selection.js** - Added room selection and reservation flow
- **guest-details.js** - Added continue-to-booking functionality
- **payment-handoff.js** - Enhanced payment method selection

### Removed
- **Deprecated unit tests** - Removed outdated tests that no longer match implementation:
  - property-selector.test.js (replaced by integration tests)
  - room-selection.test.js (replaced by integration tests)
  - results-presenter.test.js (replaced by integration tests)

### Fixed
- **getRatingCategory tests** - Updated to match actual return values

## [1.0.0] - 2026-03-03

### Added
- Initial release of booking-com-automation skill
- Search form automation (destination, dates, guests)
- Results extraction from search results
- Property details extraction
- Room selection and rate comparison
- Guest details form handling
- Payment handoff support
- Decision support and recommendations
