---
name: Hotel Search Story
description: User story for hotel search functionality
title: '[STORY] Hotel Search - <feature>'
labels: ['user-story', 'hotel-search', 'sprint-2']
body:
  - type: markdown
    attributes:
      value: |
        ## Hotel Search User Story
        
        As a traveler, I want to search for hotels naturally, so that I can find accommodations quickly.
        
  - type: textarea
    id: story
    attributes:
      label: User Story
      description: As a [user], I want [goal] so that [benefit]
      placeholder: As a traveler, I want to search for hotels in Paris so that I can find a place to stay.
    validations:
      required: true
      
  - type: textarea
    id: acceptance
    attributes:
      label: Acceptance Criteria
      description: What must be true for this story to be complete
      placeholder: |
        - [ ] User can enter destination naturally
        - [ ] Dates are parsed correctly
        - [ ] Search form is filled automatically
        - [ ] Results are extracted and displayed
    validations:
      required: true
      
  - type: textarea
    id: tasks
    attributes:
      label: Implementation Tasks
      description: Technical tasks to complete
      placeholder: |
        - [ ] Create input parser
        - [ ] Implement form filler
        - [ ] Add result extractor
        - [ ] Write tests
    validations:
      required: true
      
  - type: dropdown
    id: epic-link
    attributes:
      label: Epic
      options:
        - Epic 2: Hotel Search
        - Epic 3: Browser Automation
        - Epic 7: Property Selection
    validations:
      required: true
      
  - type: input
    id: estimate
    attributes:
      label: Story Points
      placeholder: "1, 2, 3, 5, 8"
    validations:
      required: true
