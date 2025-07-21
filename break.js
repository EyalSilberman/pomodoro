let timeLeft = 0;
let currentTask = null;
let allTasks = [];

function updateTimer() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  document.getElementById('breakTimer').textContent = 
    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  if (timeLeft <= 0) {
    window.close();
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Get initial timer state and current task from background
  chrome.runtime.sendMessage({ command: 'getState' });
  chrome.runtime.sendMessage({ command: 'getCurrentTask' });
  chrome.runtime.sendMessage({ command: 'getTasks' });
  
  // Add event listeners for task interaction buttons
  setupTaskEventListeners();
});

// Listen for messages from background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.timeLeft !== undefined && message.isBreak) {
    timeLeft = message.timeLeft;
    updateTimer();
  }
  
  if (message.task !== undefined) {
    currentTask = message.task;
    displayCurrentTask();
  }
  
  if (message.tasks) {
    allTasks = message.tasks;
  }
});

// Display current task information
function displayCurrentTask() {
  const taskInfo = document.getElementById('taskInfo');
  const taskName = document.getElementById('taskName');
  const taskDescription = document.getElementById('taskDescription');
  
  if (currentTask) {
    taskName.textContent = currentTask.name;
    taskDescription.textContent = currentTask.description;
    taskInfo.style.display = 'block';
  } else {
    taskInfo.style.display = 'none';
  }
}

// Setup event listeners for task interaction
function setupTaskEventListeners() {
  document.getElementById('taskFinished').addEventListener('click', handleTaskFinished);
  document.getElementById('taskNotFinished').addEventListener('click', handleTaskNotFinished);
  document.getElementById('continueTask').addEventListener('click', handleContinueTask);
  document.getElementById('moveToNext').addEventListener('click', handleMoveToNext);
}

// Handle task finished
function handleTaskFinished() {
  if (currentTask) {
    // Mark current task as completed
    chrome.runtime.sendMessage({
      command: 'updateTaskStatus',
      taskId: currentTask.id,
      status: 'completed'
    });
    
    // Hide question, show next task info
    document.querySelector('.task-question').style.display = 'none';
    showNextTask();
  }
}

// Handle task not finished
function handleTaskNotFinished() {
  // Hide question, show continue options
  document.querySelector('.task-question').style.display = 'none';
  document.getElementById('continueOptions').style.display = 'block';
}

// Handle continue with current task
function handleContinueTask() {
  // Keep current task as is, show confirmation
  document.getElementById('continueOptions').style.display = 'none';
  document.getElementById('nextTaskInfo').style.display = 'block';
  document.getElementById('nextTaskName').textContent = currentTask ? currentTask.name : 'No task';
}

// Handle move to next task
function handleMoveToNext() {
  if (currentTask) {
    // Mark current task as completed
    chrome.runtime.sendMessage({
      command: 'updateTaskStatus',
      taskId: currentTask.id,
      status: 'completed'
    });
    
    // Hide continue options, show next task
    document.getElementById('continueOptions').style.display = 'none';
    showNextTask();
  }
}

// Show next available task
function showNextTask() {
  // Find the next pending task
  const nextTask = allTasks.find(task => task.status === 'pending');
  
  if (nextTask) {
    // Set next task as in-progress
    chrome.runtime.sendMessage({
      command: 'updateTaskStatus',
      taskId: nextTask.id,
      status: 'in-progress'
    });
    
    chrome.runtime.sendMessage({
      command: 'setCurrentTask',
      task: nextTask
    });
    
    document.getElementById('nextTaskInfo').style.display = 'block';
    document.getElementById('nextTaskName').textContent = nextTask.name;
  } else {
    // No more tasks
    document.getElementById('nextTaskInfo').style.display = 'block';
    document.getElementById('nextTaskName').textContent = 'No more tasks available';
  }
}

// Update timer display every second
setInterval(updateTimer, 1000);