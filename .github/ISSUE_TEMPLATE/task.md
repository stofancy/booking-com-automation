---
name: ✅ Task
description: Implementable unit of work from a user story
title: '[TASK] <title>'
labels: ['task']
body:
  - type: markdown
    attributes:
      value: |
        ## Task Definition
        Tasks are small, implementable units of work that can be completed in a few hours.
        
  - type: textarea
    id: description
    attributes:
      label: Description
      description: What needs to be done?
      placeholder: Implement the search function to call booking.com API...
    validations:
      required: true
      
  - type: textarea
    id: implementation-notes
    attributes:
      label: Implementation Notes
      description: Any technical details, approaches, or constraints
      placeholder: Use browser tool with profile="chrome", handle selectors...
      
  - type: textarea
    id: test-plan
    attributes:
      label: Test Plan
      description: How will this be tested?
      placeholder: |
        1. Run unit test: npm test -- search-flights.test.js
        2. Verify mock data is parsed correctly
        3. Check error handling for timeout scenarios
    validations:
      required: true
      
  - type: input
    id: story-link
    attributes:
      label: Parent Story
      description: Link to user story issue number
      placeholder: "#5"
    validations:
      required: true
      
  - type: dropdown
    id: effort
    attributes:
      label: Effort
      description: Time estimate
      options:
        - < 1 hour
        - 1-2 hours
        - 2-4 hours
        - 4-8 hours
        - 1-2 days
    validations:
      required: true
      
  - type: dropdown
    id: type
    attributes:
      label: Task Type
      options:
        - Implementation
        - Testing
        - Documentation
        - Refactoring
        - Bug Fix
        - Infrastructure
    validations:
      required: true
