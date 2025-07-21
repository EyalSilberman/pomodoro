# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome extension that implements a Pomodoro Timer with Google Sheets integration and task management:

- **Manifest V3 Chrome Extension** - Uses service workers and modern Chrome APIs
- **Google Sheets Integration** - Logs sessions and fetches tasks from Google Sheets via Apps Script
- **Task Management System** - Track and manage tasks during Pomodoro sessions
- **Core Components**: 
  - `background.js` - Service worker handling timer logic, state management, and Google Sheets integration
  - `popup.js/popup.html` - Main UI popup with timer display, controls, and task management
  - `break.js/break.html` - Break screen that opens in a new tab with task completion options
  - `tasks.js/tasks.html` - Dedicated task management interface
  - `Code.gs` - Google Apps Script for Sheets integration

## Key Architecture Patterns

### State Management
- Timer state is managed in the background service worker (`background.js`)
- Communication between components uses `chrome.runtime.sendMessage()` and `chrome.runtime.onMessage`
- Persistent storage uses Chrome's `chrome.storage.local` and `chrome.storage.sync` APIs
- Main state variables: `timeLeft`, `isBreak`, `autoRestart`, `timer`, `currentTask`, `lastSessionTask`

### Task Management
- Tasks are fetched from Google Sheets and stored locally
- Each task has: `id`, `name`, `status` (pending/in-progress/completed), `description`, `priority`
- Only one task can be "in-progress" at a time (current working task)
- Task completion can happen during work sessions or breaks
- Task transitions: pending → in-progress → completed

### Google Sheets Integration
- Uses Google Apps Script (`Code.gs`) as a web app endpoint
- Authenticates via secret key stored in `chrome.storage.sync`
- Functions: `logSession()` for session logging, `fetchTasks()` for task retrieval
- Supports multiple sheet names for different task lists
- Logging can be enabled/disabled via settings

### Timer Flow
1. Work session (25 minutes) with assigned task → Break session (5 minutes) → repeat
2. Break screen automatically opens in new tab when break starts
3. During breaks, users can mark tasks complete or continue with current task
4. Auto-restart functionality can be toggled by user
5. All sessions are logged with task information

## File Structure

```
├── manifest.json          # Extension configuration
├── background.js           # Service worker (timer logic, Google Sheets integration)
├── popup.html/popup.js     # Main popup interface with task management
├── break.html/break.js     # Break screen with task completion options
├── tasks.html/tasks.js     # Dedicated task management interface
├── Code.gs                 # Google Apps Script for Sheets integration
├── icons/                  # Extension icons
└── tasks/                  # Task documentation folder
```

## Data Storage

### Chrome Local Storage (`chrome.storage.local`)
- `tasks` - Array of task objects with id, name, status, description, priority
- `taskSheetName` - Name of the Google Sheet containing tasks
- `autoRestart` - Boolean setting for automatic session restart

### Chrome Sync Storage (`chrome.storage.sync`)
- `webAppUrl` - Google Apps Script web app URL for Sheets integration
- `secretKey` - Authentication key for Google Sheets access
- `enableLogging` - Boolean to enable/disable session logging

## Google Sheets Structure

### Session Log Sheet
Expected columns: Date, Start Time, End Time, Type, Duration (min), Completed, Task

### Task Sheet
Expected columns: Task Name, Description, Priority, Status (optional)

## Development Commands

Since this is a Chrome extension, there are no build commands or package.json. Development workflow:

1. **Load Extension**: Chrome → Extensions → Developer Mode → Load Unpacked
2. **Test Changes**: Reload extension in Chrome after code changes
3. **Debug**: Use Chrome DevTools for each component:
   - Popup: Right-click extension icon → Inspect popup
   - Background: Extensions page → Inspect views: service worker
   - Break/Tasks tabs: Standard F12 DevTools
4. **Google Sheets Setup**: Deploy `Code.gs` as web app and configure URL/secret in extension

## Chrome Extension APIs Used

- `chrome.runtime` - Message passing between components
- `chrome.storage.local` / `chrome.storage.sync` - Data persistence and settings
- `chrome.action` - Badge updates and popup
- `chrome.tabs` - Creating/managing break and task tabs
- `chrome.alarms` - Not currently used but available for future timer improvements

## Common Integration Patterns

### Message Passing Commands
- `getState` - Get current timer and task state
- `getTasks` / `loadTasks` - Task management operations
- `updateTaskStatus` / `setCurrentTask` - Task state updates
- `markTaskComplete` - Complete current task and advance to next
- `startTimer` / `pauseTimer` / `resetTimer` - Timer controls

### Task Status Flow
```
pending → in-progress (becomes currentTask) → completed
```

### Session Lifecycle
1. Start work session with current task
2. Timer runs, logs session on completion/pause/reset
3. On work session end, enter break with task completion options
4. Break ends, return to work with next task or continue current

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