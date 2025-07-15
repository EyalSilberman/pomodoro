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