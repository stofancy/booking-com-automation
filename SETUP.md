# Setup Guide - Booking.com Automation Skill

## Repository Status

✅ **Repository Created**: https://github.com/stofancy/booking-com-automation (Private)

✅ **Initial Commit Pushed**: Main branch with project structure

✅ **Issues Created**: 
- 6 Epic issues (#1-6)
- Labels: epic, user-story, task, in progress, not started

## ⚠️ Action Required: GitHub Authentication

To complete the setup, you need to refresh your GitHub authentication with additional scopes:

### Step 1: Refresh GitHub Auth

Run this command in your terminal:

```bash
gh auth refresh -h github.com -s workflow,project,read:project
```

This will:
- Open a browser window
- Ask you to authorize additional scopes (workflow, project)
- Update your local authentication token

### Step 2: Push CI/CD Workflows

After refreshing auth, run:

```bash
cd ~/.openclaw/workspace/skills/booking-com-automation
git add .github/workflows/
git commit -m "feat: add CI/CD workflows"
git push origin main
```

### Step 3: Create Project Board

After auth refresh, run:

```bash
gh project create --title "Booking.com Automation" --owner stofancy
```

Then add issues to the project board.

## Current Progress

### Epic 1: Foundation & Infrastructure (In Progress)

**Completed:**
- ✅ T1.1.1-5: Project initialization (repo, git, .gitignore, README, package.json)
- ✅ T1.3.1-3: Issue templates (epic.md, user-story.md, task.md)
- ✅ T1.4.1: SKILL.md skeleton created

**In Progress:**
- ⏳ T1.2.1-4: CI/CD workflows (created locally, need to push)
- ⏳ T1.3.4-5: Project board (needs auth refresh)
- ⏳ T1.4.2-5: Skill scripts and validation

## Project Structure

```
booking-com-automation/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── epic.md
│   │   ├── user-story.md
│   │   └── task.md
│   └── workflows/          (needs to be pushed)
│       ├── test.yml
│       └── package.yml
├── .state/
│   └── checkpoint.json     (development state)
├── scripts/
│   ├── validate-skill.js
│   └── package-skill.js
├── references/
├── tests/
├── EPICS.md                (full epic breakdown)
├── PROJECT_PLAN.md         (sprint tracking)
├── SKILL.md                (OpenClaw skill definition)
├── README.md
└── package.json
```

## Next Steps

1. **Immediate**: Complete Step 1-3 above (auth refresh)
2. **Sprint 1 Goal**: Complete Epic 1 (Foundation)
3. **Sprint 2**: Start Epic 2 (Browser Automation)

## Development Workflow

### Before Starting Work
```bash
# Pull latest
git pull origin main

# Check current state
cat .state/checkpoint.json
```

### After Completing a Task
```bash
# Update checkpoint
# Edit .state/checkpoint.json to mark task complete

# Commit changes
git add -A
git commit -m "feat: complete T1.2.1 - Create test.yml workflow"

# Push
git push origin main
```

### Creating New Issues
```bash
# For user stories
gh issue create --title "[STORY] <title>" --label "user-story" --body "<description>"

# For tasks
gh issue create --title "[TASK] <title>" --label "task" --body "<description>"
```

## Testing Locally

```bash
# Install dependencies
npm install

# Run validation
npm run validate

# Run tests (when implemented)
npm test
```

## Questions?

- Check EPICS.md for full task breakdown
- Check .state/checkpoint.json for current progress
- View issues: https://github.com/stofancy/booking-com-automation/issues

---

**Last Updated**: 2026-03-01  
**Current Sprint**: 1  
**Next Milestone**: Complete Epic 1
