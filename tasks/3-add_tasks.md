# What we want to achive
now we add new main feature - the user can add tasks to the pomodoro.
The tasks will come from the same spreadsheet, but from another sheet.


# How to achive this
1. Create new button that open new options: 'task manager'.
2. when press, open input place to put the sheet name in the spreadsheet and load button.
3. when press make loading indicater.
4. meanwhile go the spreadsheet, the sheet name, and get from there the tasks list from table with 2 headers: task, description.
5. save all the tasks to the extension.
6. The user can see all the task in tasks.html (below). with button in the task manager.


# Some extra data you will use
```
//tasks.html
<!DOCTYPE html>
<html>
<head>
  <title>Pomodoro Tasks</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: Arial, sans-serif;
      background-color: #f5f5f5;
      color: #333;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      padding: 30px;
    }
    h1 {
      text-align: center;
      color: #4CAF50;
      margin-bottom: 30px;
      font-size: 2.5em;
    }
    .task-stats {
      display: flex;
      justify-content: space-around;
      margin-bottom: 30px;
      padding: 20px;
      background-color: #f9f9f9;
      border-radius: 5px;
    }
    .stat-item {
      text-align: center;
    }
    .stat-number {
      font-size: 2em;
      font-weight: bold;
      color: #4CAF50;
    }
    .stat-label {
      font-size: 0.9em;
      color: #666;
    }
    .task-list {
      margin-top: 20px;
    }
    .task-item {
      display: flex;
      align-items: center;
      padding: 15px;
      margin-bottom: 10px;
      background-color: #f9f9f9;
      border-radius: 5px;
      border-left: 4px solid #ddd;
      transition: all 0.3s ease;
    }
    .task-item:hover {
      background-color: #f0f0f0;
      transform: translateX(5px);
    }
    .task-item.pending {
      border-left-color: #2196F3;
    }
    .task-item.in-progress {
      border-left-color: #FF9800;
      background-color: #fff3e0;
    }
    .task-item.completed {
      border-left-color: #4CAF50;
      background-color: #e8f5e8;
    }
    .task-status {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      margin-right: 15px;
      flex-shrink: 0;
    }
    .task-status.pending {
      background-color: #2196F3;
    }
    .task-status.in-progress {
      background-color: #FF9800;
    }
    .task-status.completed {
      background-color: #4CAF50;
    }
    .task-content {
      flex-grow: 1;
    }
    .task-name {
      font-weight: bold;
      font-size: 1.1em;
      margin-bottom: 5px;
    }
    .task-description {
      color: #666;
      font-size: 0.9em;
      line-height: 1.4;
    }
    .task-index {
      font-weight: bold;
      color: #888;
      margin-right: 10px;
      min-width: 30px;
    }
    .no-tasks {
      text-align: center;
      color: #666;
      font-style: italic;
      padding: 40px;
    }
    .current-task-indicator {
      background-color: #4CAF50;
      color: white;
      padding: 3px 8px;
      border-radius: 3px;
      font-size: 0.8em;
      margin-left: 10px;
    }
    .refresh-btn {
      background-color: #4CAF50;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 1em;
      margin-bottom: 20px;
    }
    .refresh-btn:hover {
      background-color: #45a049;
    }
    .loading {
      text-align: center;
      padding: 40px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Pomodoro Tasks</h1>
    
    <button id="refreshBtn" class="refresh-btn">Refresh Tasks</button>
    
    <div id="taskStats" class="task-stats">
      <div class="stat-item">
        <div class="stat-number" id="totalTasks">0</div>
        <div class="stat-label">Total Tasks</div>
      </div>
      <div class="stat-item">
        <div class="stat-number" id="completedTasks">0</div>
        <div class="stat-label">Completed</div>
      </div>
      <div class="stat-item">
        <div class="stat-number" id="pendingTasks">0</div>
        <div class="stat-label">Pending</div>
      </div>
    </div>
    
    <div id="taskList" class="task-list">
      <div class="loading">Loading tasks...</div>
    </div>
  </div>
  
  <script src="tasks.js"></script>
</body>
</html>
```

# REMEBER - FOLLOW EXACTLY THE MANDATORY WORKFLOW!
### Don't forget to update the readme.md with the new changes.

# Claude section where you write your MANDATORY WORKFLOW outputs:

## Implementation Plan

After thoroughly examining the codebase, I understand the current Google Sheets integration and architecture. Here's my detailed plan to implement the task management feature:

### Current Architecture Analysis:
- The extension uses Chrome's `webAppUrl` and `secretKey` stored in sync storage for Google Sheets integration
- Google Apps Script (`Code.gs`) handles POST requests to append data to sheets  
- The extension has `background.js` (service worker), `popup.js/popup.html` (main UI), and `break.js/break.html` (break screen)
- No `logs.js/logs.html` files exist yet, but `tasks.html` template is provided in the task description

### Implementation Todo List:

- [ ] **1. Extend Google Apps Script (`Code.gs`) to support fetching tasks from a specified sheet**
  - USE THIS WORKING CODE:
```javascript
/**
 * Get tasks from the specified sheet
 */
function getTasks(sheetName) {
  try {
    // Open the spreadsheet and get the specified sheet
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet) {
      return ContentService
        .createTextOutput(JSON.stringify({ "status": "error", "message": `Sheet "${sheetName}" not found.` }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Get all data from the sheet
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    if (values.length < 2) {
      return ContentService
        .createTextOutput(JSON.stringify({ "status": "error", "message": "Sheet must have at least a header row and one data row." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Assume first row is headers: [Task Name, Description]
    const headers = values[0];
    const tasks = [];
    
    // Process each row after the header
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if (row[0] && row[0].toString().trim()) { // Only include rows with task names
        tasks.push({
          id: `task_${i}`,
          name: row[0].toString().trim(),
          description: row[1] ? row[1].toString().trim() : '',
          status: 'pending'
        });
      }
    }

    return ContentService
      .createTextOutput(JSON.stringify({ 
        "status": "success", 
        "message": "Tasks loaded successfully.",
        "tasks": tasks
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```
  - Add new function to handle GET requests for retrieving tasks
  - Add sheet name parameter to fetch from different sheets within the same spreadsheet
  - Expected format: sheet with "task" and "description" headers

- [ ] **2. Add task manager button to popup.html**
  - Add "Task Manager" button in the main popup interface
  - Position it appropriately within the existing UI layout

- [ ] **3. Create task configuration modal/section in popup**
  - Add input field for sheet name
  - Add "Load Tasks" button with loading indicator
  - Handle task loading from specified sheet

- [ ] **4. Implement task fetching logic in popup.js**
  - Add function to call Google Sheets API for task retrieval
  - Store tasks in Chrome storage (`chrome.storage.local`)
  - Handle loading states and error scenarios

- [ ] **5. Create tasks.html file** 
  - Use provided template from task description
  - Implement task display with status indicators (pending, in-progress, completed)
  - Add refresh functionality

- [ ] **6. Create tasks.js file**
  - Implement task list rendering from stored data
  - Add task status management (pending/in-progress/completed)
  - Handle task refresh from Google Sheets
  - Implement statistics calculation (total, completed, pending)

- [ ] **7. Update manifest.json**
  - Add tasks.html as accessible extension page if needed
  - Ensure all necessary permissions are included

- [ ] **8. Enhance background.js for task management**
  - Add message handling for task-related operations
  - Implement task state synchronization

### File Dependencies:
- **Files to modify**: `Code.gs`, `popup.html`, `popup.js`, `manifest.json`, `background.js`
- **Files to create**: `tasks.html`, `tasks.js`
- **Storage**: Tasks will be stored in `chrome.storage.local` with key `tasks`

### Integration Points:
- Reuse existing Google Sheets configuration (webAppUrl, secretKey)
- Maintain consistency with current UI styling and patterns
- Follow existing message passing patterns between components

**Estimated Impact**: Medium complexity - builds on existing Google Sheets integration, requires new UI components and data flow, but follows established patterns.

**Dependencies**: None - all features can be implemented independently and incrementally.

## Implementation Log

### ✅ Task 1: Extended Google Apps Script (Code.gs) - `background.js:21-103`
**Timestamp**: 2025-07-15
**Changes Made**: 
- Added `doGet()` function to handle GET requests for fetching tasks
- Integrated provided `getTasks()` function with security validation
- Added support for `action=getTasks&sheetName=X` parameter format
**Why Necessary**: Enables the extension to fetch task data from specified Google Sheets tabs using GET requests while maintaining security through secret key validation.

### ✅ Task 2: Added Task Manager Button - `popup.html:113`
**Timestamp**: 2025-07-15
**Changes Made**:
- Added "Task Manager" button with purple styling to match extension theme
- Positioned button appropriately in the popup interface flow
**Why Necessary**: Provides user access point to the new task management feature from the main popup interface.

### ✅ Task 3: Created Task Configuration Section - `popup.html:177-184`
**Timestamp**: 2025-07-15
**Changes Made**:
- Added task configuration container with sheet name input
- Implemented "Load Tasks" button with loading indicator
- Added "View Tasks" button that appears after successful load
- Added appropriate CSS styling for all new elements
**Why Necessary**: Allows users to specify which Google Sheets tab contains their tasks and provides feedback during the loading process.

### ✅ Task 4: Implemented Task Fetching Logic - `popup.js:186-264`
**Timestamp**: 2025-07-15
**Changes Made**:
- Added click handler for Task Manager button to toggle configuration section
- Implemented async task loading with error handling and validation
- Added task storage in Chrome local storage with keys `tasks` and `taskSheetName`
- Implemented "View Tasks" functionality to open tasks.html in new tab
**Why Necessary**: Provides the core functionality to fetch tasks from Google Sheets, validate user input, handle errors gracefully, and store tasks locally for offline access.

### ✅ Task 5: Created tasks.html - `/Users/eyal/pomodoro/pomodoro/tasks.html`
**Timestamp**: 2025-07-15
**Changes Made**:
- Used provided template with task display styling
- Added statistics section showing total, completed, and pending tasks
- Implemented responsive design with hover effects and status indicators
- Added refresh button for updating tasks from Google Sheets
**Why Necessary**: Provides dedicated interface for viewing and managing tasks with clear visual status indicators and statistics.

### ✅ Task 6: Created tasks.js - `/Users/eyal/pomodoro/pomodoro/tasks.js`
**Timestamp**: 2025-07-15
**Changes Made**:
- Implemented task loading from Chrome storage
- Added task status management (pending → in-progress → completed → pending cycle)
- Created refresh functionality that preserves existing task statuses
- Added statistics calculation and display updates
- Implemented error handling and user feedback
**Why Necessary**: Provides interactive task management functionality, allowing users to track progress while maintaining state across refreshes.

### ✅ Task 7: Updated manifest.json - `manifest.json` (No changes needed)
**Timestamp**: 2025-07-15
**Changes Made**: No changes required
**Why Necessary**: Chrome extensions automatically include all HTML files in the extension directory, so tasks.html is accessible without manifest modifications.

### ✅ Task 8: Enhanced background.js - `background.js:60-99`
**Timestamp**: 2025-07-15
**Changes Made**:
- Added `getTasks` command handler for retrieving tasks from storage
- Added `updateTaskStatus` command handler for updating task status
- Implemented proper async response handling with sendResponse
**Why Necessary**: Provides centralized task management through the background service worker, enabling communication between popup and tasks page.

## Review Summary

All planned features have been successfully implemented:

**✅ Core Functionality Delivered**:
- Task Manager button added to popup interface with intuitive UI
- Sheet name configuration with loading indicators and error handling  
- Google Sheets integration extended to support task fetching via GET requests
- Task data storage in Chrome local storage for offline access
- Dedicated tasks.html interface with statistics and status management
- Interactive task status cycling (pending → in-progress → completed)
- Refresh functionality that preserves user progress

**✅ Architecture & Integration**:
- Leveraged existing Google Sheets configuration (webAppUrl, secretKey)
- Followed established Chrome extension messaging patterns
- Maintained consistent UI styling with existing components
- Implemented proper error handling and user feedback

**✅ User Experience**:
- Clear visual task status indicators with color coding
- Loading indicators during task fetch operations
- Informative error messages for configuration issues
- Statistics dashboard showing task progress

**🔧 Technical Challenges Encountered**: None - implementation followed planned architecture successfully.

**🧪 Testing Performed**: Code review and structural validation completed. Extension ready for manual testing.

## Task Completed

**Date Completed**: 2025-07-15

**Files Modified**: 
- `Code.gs` - Added GET request handling and task fetching
- `popup.html` - Added Task Manager button and configuration section  
- `popup.js` - Implemented task fetching logic and UI handlers
- `background.js` - Added task management message handlers

**Files Created**:
- `tasks.html` - Task management interface
- `tasks.js` - Task interaction and status management logic

**Brief Description of Solution**: 
Successfully implemented a complete task management system that integrates with Google Sheets. Users can now specify a sheet name, load tasks into the extension, view them in a dedicated interface, and track their progress with status indicators. The implementation leverages the existing Google Sheets infrastructure and maintains consistency with the extension's architecture.

**Notes for Future Work**:
- Consider adding task filtering/search functionality
- Potential integration with Pomodoro timer (e.g., auto-advance task status on session completion)
- Option to add new tasks directly from the extension interface

### ✅ Additional Task Completed: Updated README.md - `README.md`
**Timestamp**: 2025-07-15
**Changes Made**:
- Added "Task Management" section to features list with 6 key capabilities
- Updated Google Sheets setup instructions to include optional "Tasks" sheet
- Added task management usage instructions in the Usage section
- Updated project structure to include `tasks.html` and `tasks.js`
- Updated Future Plans to mark task management as completed
**Why Necessary**: Documentation needed to be updated to reflect the new task management functionality for users to understand and use the feature.