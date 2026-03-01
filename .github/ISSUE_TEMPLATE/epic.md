---
name: 🎯 Epic
description: Large body of work that can be broken down into user stories
title: '[EPIC] <title>'
labels: ['epic']
body:
  - type: markdown
    attributes:
      value: |
        ## Epic Definition
        Epics are large bodies of work that span multiple sprints and contain multiple user stories.
        
  - type: textarea
    id: description
    attributes:
      label: Description
      description: What is this epic about?
      placeholder: As a user, I want to... so that...
    validations:
      required: true
      
  - type: textarea
    id: success-criteria
    attributes:
      label: Success Criteria
      description: How will we know this epic is complete?
      placeholder: List measurable outcomes
    validations:
      required: true
      
  - type: textarea
    id: stories
    attributes:
      label: User Stories
      description: Link to or list the user stories in this epic
      placeholder: "- #1 - Search for flights\n- #2 - Filter results..."
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
    id: estimate
    attributes:
      label: Story Point Estimate
      description: Total story points for this epic
      placeholder: e.g., 21
