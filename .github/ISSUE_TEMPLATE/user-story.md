---
name: 📖 User Story
description: A feature from the user's perspective
title: '[STORY] <title>'
labels: ['user-story']
body:
  - type: markdown
    attributes:
      value: |
        ## User Story Format
        As a [type of user], I want [goal] so that [reason/benefit].
        
  - type: textarea
    id: story
    attributes:
      label: User Story
      description: Write the story in standard format
      placeholder: As a traveler, I want to search for flights so that I can find the best options for my trip.
    validations:
      required: true
      
  - type: textarea
    id: acceptance-criteria
    attributes:
      label: Acceptance Criteria
      description: List criteria that must be met for this story to be considered done
      placeholder: |
        - [ ] User can enter departure and arrival cities
        - [ ] User can select travel dates
        - [ ] Results show at least 3 flight options
        - [ ] Each option displays price, duration, and airline
    validations:
      required: true
      
  - type: textarea
    id: tasks
    attributes:
      label: Tasks
      description: Break down into implementable tasks
      placeholder: |
        - [ ] Create search form UI
        - [ ] Implement date picker
        - [ ] Build search API call
        - [ ] Parse and display results
    validations:
      required: true
      
  - type: dropdown
    id: priority
    attributes:
      label: Priority
      options:
        - Critical
        - High
        - Medium
        - Low
    validations:
      required: true
      
  - type: input
    id: epic-link
    attributes:
      label: Epic Link
      description: Link to parent epic issue number
      placeholder: "#1"
    validations:
      required: true
      
  - type: input
    id: estimate
    attributes:
      label: Story Points
      description: Estimate using Fibonacci sequence
      placeholder: "1, 2, 3, 5, 8, 13"
    validations:
      required: true
      
  - type: dropdown
    id: testing
    attributes:
      label: Testing Required
      options:
        - Unit tests only
        - Integration tests only
        - Both unit and integration
        - Manual testing only
    validations:
      required: true
