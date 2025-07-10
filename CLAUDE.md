# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome extension that implements a Pomodoro Timer with the following architecture:

- **Manifest V3 Chrome Extension** - Uses service workers and modern Chrome APIs
- **Core Components**: 
  - `background.js` - Service worker handling timer logic and state management
  - `popup.js/popup.html` - Main UI popup with timer display and controls
  - `break.js/break.html` - Break screen that opens in a new tab
  - `logs.js/logs.html` - Statistics and session history viewer

## Key Architecture Patterns

### State Management
- Timer state is managed in the background service worker (`background.js`)
- Communication between components uses `chrome.runtime.sendMessage()` and `chrome.runtime.onMessage`
- Persistent storage uses Chrome's `chrome.storage.local` API
- Main state variables: `timeLeft`, `isBreak`, `autoRestart`, `timer`

### Timer Flow
1. Work session (25 minutes) → Break session (5 minutes) → repeat
2. Break screen automatically opens in new tab when break starts
3. Auto-restart functionality can be toggled by user
4. Sessions are logged with timestamps and completion status

### UI Components
- **Popup**: Primary interface with timer display, start/pause/reset buttons
- **Break Tab**: Red-themed countdown display that auto-closes
- **Logs Tab**: Statistics dashboard with CSV export functionality

## Development Commands

Since this is a Chrome extension, there are no build commands or package.json. Development workflow:

1. **Load Extension**: Chrome → Extensions → Developer Mode → Load Unpacked
2. **Test Changes**: Reload extension in Chrome after code changes
3. **Debug**: Use Chrome DevTools for each component:
   - Popup: Right-click extension icon → Inspect popup
   - Background: Extensions page → Inspect views: service worker
   - Break/Logs tabs: Standard F12 DevTools

## File Structure

```
├── manifest.json          # Extension configuration
├── background.js           # Service worker (timer logic)
├── popup.html/popup.js     # Main popup interface
├── break.html/break.js     # Break screen
├── logs.html/logs.js       # Session statistics
└── icons/                  # Extension icons
```

## Data Storage

The extension uses Chrome's local storage for:
- `sessionLogs` - Array of session objects with start/end times, type, duration, completion status
- `autoRestart` - Boolean setting for automatic session restart

## Common Tasks

- **Adding new features**: Most logic goes in `background.js` for timer functionality, `popup.js` for UI controls
- **Styling changes**: Inline CSS in respective HTML files
- **Storage changes**: Use `chrome.storage.local` API consistently
- **Testing**: Load extension in Chrome and test all user flows (work → break → work cycle)

## Chrome Extension APIs Used

- `chrome.runtime` - Message passing between components
- `chrome.storage.local` - Data persistence
- `chrome.action` - Badge updates and popup
- `chrome.tabs` - Creating/managing break tab
- `chrome.alarms` - Not currently used but available for future timer improvements

# ⚠️ MANDATORY WORKFLOW - FOLLOW EXACTLY ⚠️

## TASK FILES
- I will provide tasks in `tasks/{n}-task_name.md` format (e.g., `tasks/1-add-login.md`, `tasks/2-fix-database.md`)
- Each task file contains the requirements and context for that specific task
- **ALWAYS** read the task file completely before starting work
- **ALL DOCUMENTATION** must be written in the original task file (`tasks/{n}-task_name.md`)

## STEP 1: PLANNING (REQUIRED BEFORE ANY CODE CHANGES)
1. **READ THE TASK FILE** - Fully understand requirements from `tasks/{n}-task_name.md`
2. **READ THE CODEBASE** - Examine all relevant files before making any changes
3. **CREATE A PLAN** - Write a detailed plan in the **original task file** (`tasks/{n}-task_name.md`) with:
   - ## Implementation Plan
   - List of specific files to modify
   - Clear todo items with checkboxes: `- [ ] Task description`
   - Estimated impact of each change
   - Dependencies between tasks
4. **WAIT FOR APPROVAL** - Do NOT start coding until I explicitly say "approved" or "proceed"

## STEP 2: IMPLEMENTATION (ONLY AFTER APPROVAL)
1. **ONE CHANGE AT A TIME** - Make the smallest possible change that moves toward the goal
2. **UPDATE TASK FILE** - Mark completed items in the task file: `- [x] Completed task`
3. **EXPLAIN EACH CHANGE** - After each modification, add to the **original task file** (`tasks/{n}-task_name.md`):
   - ## Implementation Log
   - What file(s) you changed
   - What the change accomplishes
   - Why this change was necessary
   - Timestamp of change
4. **ASK BEFORE CONTINUING** - Wait for my feedback before moving to the next todo item

## STEP 3: COMPLETION
1. **REVIEW SECTION** - Add a review section to the **original task file** (`tasks/{n}-task_name.md`) with:
   - ## Review Summary
   - Overview of all changes made
   - Any challenges encountered
   - Testing performed
2. **TASK SUMMARY** - Add a completion summary to the **original task file** (`tasks/{n}-task_name.md`) with:
   - ## Task Completed
   - Date completed
   - Files modified
   - Brief description of solution implemented
   - Any notes or considerations for future work
3. **CONFIRM COMPLETION** - Ask if the task is complete or if additional work is needed

## RULES THAT CANNOT BE BROKEN:
- ❌ **NEVER** start coding without creating a plan first
- ❌ **NEVER** make multiple changes without explaining each one
- ❌ **NEVER** proceed to the next todo item without confirmation
- ❌ **NEVER** make "quick fixes" outside the planned workflow
- ✅ **ALWAYS** prioritize simplicity over complexity
- ✅ **ALWAYS** minimize the impact of each change
- ✅ **ALWAYS** update `tasks/{n}-task_name.md` as you work

## IF YOU IGNORE THIS WORKFLOW:
I will stop the task and ask you to start over with proper planning.