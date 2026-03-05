# Contributing to Booking.com Automation Skill

Thank you for your interest in contributing to the booking-com-automation skill! This document outlines the guidelines and processes for contributing.

## Development Workflow

### 1. Issue Tracking
- All work should be tracked through GitHub Issues
- Use the existing epic/story/task structure for new features
- Reference issues in commit messages (e.g., "Fix #123: Resolve date parsing issue")

### 2. Branch Strategy
- Create feature branches from `main`
- Use descriptive branch names (e.g., `feature/hotel-search`, `fix/date-parsing`)
- Keep branches focused on single features or fixes

### 3. Code Standards
- Follow existing code patterns and style
- Write comprehensive unit tests for new functionality
- Ensure all tests pass before submitting PRs
- Run linter before committing (`npm run lint`)

### 4. Testing Requirements
- **Unit Tests**: All new functions must have unit tests
- **Integration Tests**: Browser automation flows need integration tests with mock data
- **Manual Testing**: Test actual booking.com interaction before merging major changes

## Documentation Updates

### When to Update Documentation
- New features or capabilities
- Breaking changes to existing functionality  
- Updated setup requirements
- New troubleshooting scenarios

### Documentation Structure
- `SKILL.md`: OpenClaw skill specification and usage examples
- `README.md`: Project overview and installation guide
- `docs/`: Technical documentation and architecture guides
- Inline comments: Complex logic and browser selector explanations

## Browser Automation Guidelines

### Selector Management
- Use `data-testid` attributes when available
- Avoid brittle CSS selectors that depend on specific class names
- Document selector assumptions in code comments
- Test selectors against multiple booking.com page variations

### Error Handling
- Implement graceful degradation for failed automation steps
- Provide clear, actionable error messages to users
- Include retry logic for transient failures
- Log detailed error context for debugging

### Performance Considerations
- Minimize unnecessary browser interactions
- Use efficient waiting strategies instead of fixed timeouts
- Cache results when appropriate to avoid redundant operations

## Pull Request Process

1. **Submit PR** against `main` branch
2. **Code Review**: At least one maintainer review required
3. **Testing**: All CI checks must pass
4. **Documentation**: Ensure relevant docs are updated
5. **Merge**: Approved PRs can be merged by maintainers

## Reporting Issues

When reporting bugs or issues, please include:

- **Steps to reproduce**
- **Expected vs actual behavior**  
- **OpenClaw version and environment details**
- **Browser automation logs** (if available)
- **Screenshots** of problematic booking.com pages (if applicable)

## Feature Requests

For new features, please:

1. **Check existing issues** to avoid duplicates
2. **Describe the use case** clearly
3. **Suggest implementation approach** if possible
4. **Indicate priority level** (nice-to-have vs critical)

## License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

---

Thank you for helping make this skill better for everyone!