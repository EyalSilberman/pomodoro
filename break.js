let timeLeft = 0;
let currentTask = null;
let lastSessionTask = null;
let allTasks = [];
let taskCompletedEarly = false;
let autoRestart = true;
let breakEndTime = null;

function updateTimer() {
  if (timeLeft > 0) {
    // Break is still running - show normal countdown
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('breakTimer').textContent = 
      `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else if (breakEndTime && !autoRestart) {
    // Break ended in manual mode - show elapsed time instead of 00:00
    const elapsed = Math.floor((Date.now() - breakEndTime) / 1000);
    const elapsedMinutes = Math.floor(elapsed / 60);
    const elapsedSeconds = elapsed % 60;
    document.getElementById('breakTimer').textContent = 
      `+${elapsedMinutes.toString().padStart(2, '0')}:${elapsedSeconds.toString().padStart(2, '0')}`;
  } else {
    // Default fallback
    document.getElementById('breakTimer').textContent = '00:00';
  }
  
  if (timeLeft <= 0) {
    // Break time ended - show appropriate button based on auto-restart setting
    updateButtonDisplay();
  }
}

function updateButtonDisplay() {
  const finishBreakContainer = document.getElementById('finishBreakContainer');
  const startNextContainer = document.getElementById('startNextContainer');
  
  if (timeLeft <= 0 && !autoRestart) {
    // Manual mode - show start next session button
    finishBreakContainer.style.display = 'none';
    startNextContainer.style.display = 'block';
  } else {
    // Auto mode or break still running - show regular button
    finishBreakContainer.style.display = 'block';
    startNextContainer.style.display = 'none';
  }
}

function updateElapsedTime() {
  if (breakEndTime && timeLeft <= 0 && !autoRestart) {
    const elapsed = Math.floor((Date.now() - breakEndTime) / 1000);
    const elapsedMinutes = Math.floor(elapsed / 60);
    const elapsedSeconds = elapsed % 60;
    
    const elapsedDisplay = `Time since break ended: ${elapsedMinutes}:${elapsedSeconds.toString().padStart(2, '0')}`;
    document.getElementById('elapsedTime').textContent = elapsedDisplay;
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Get initial timer state and current task from background
  chrome.runtime.sendMessage({ command: 'getState' });
  chrome.runtime.sendMessage({ command: 'getCurrentTask' });
  
  // Get fresh tasks data from storage
  chrome.runtime.sendMessage({ command: 'getTasks' }, (response) => {
    if (response && response.tasks) {
      allTasks = response.tasks;
      // Re-display current task with updated task list
      displayCurrentTask();
    }
  });
  
  // Add event listeners for task interaction buttons
  setupTaskEventListeners();
  
  // Add event listener for finish break button
  document.getElementById('finishBreakBtn').addEventListener('click', finishBreak);
  
  // Add event listener for start next session button
  document.getElementById('startNextBtn').addEventListener('click', startNextSession);
});

// Listen for messages from background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.timeLeft !== undefined && message.isBreak) {
    timeLeft = message.timeLeft;
    updateTimer();
  }
  
  if (message.task !== undefined) {
    currentTask = message.task;
  }
  
  if (message.lastSessionTask !== undefined) {
    lastSessionTask = message.lastSessionTask;
    displayCurrentTask();
  }
  
  if (message.tasks) {
    allTasks = message.tasks;
  }
  
  if (message.taskCompletedEarly !== undefined) {
    taskCompletedEarly = message.taskCompletedEarly;
    displayCurrentTask();
  }
  
  if (message.autoRestart !== undefined) {
    autoRestart = message.autoRestart;
    updateButtonDisplay();
  }
  
  if (message.breakEndTime !== undefined) {
    breakEndTime = message.breakEndTime;
  }
});

// Display current task information
function displayCurrentTask() {
  const taskInfo = document.getElementById('taskInfo');
  const taskName = document.getElementById('taskName');
  const taskDescription = document.getElementById('taskDescription');
  const taskQuestion = document.querySelector('.task-question');
  const nextTaskInfo = document.getElementById('nextTaskInfo');
  const nextTaskName = document.getElementById('nextTaskName');
  
  // Show the task that was actually worked on in the last session
  const displayTask = lastSessionTask || currentTask;
  if (displayTask) {
    taskName.textContent = displayTask.name;
    taskDescription.textContent = displayTask.description;
    taskInfo.style.display = 'block';
    
    if (taskCompletedEarly) {
      // Show simplified view - task already completed, just show next task
      taskQuestion.style.display = 'none';
      
      // Get current task from background (which should be the next task now)
      chrome.runtime.sendMessage({ command: 'getCurrentTask' }, (response) => {
        if (response && response.task) {
          nextTaskInfo.style.display = 'block';
          nextTaskName.textContent = response.task.name;
        } else {
          // Fallback: look for pending tasks
          const nextTask = allTasks.find(task => task.status === 'pending');
          if (nextTask) {
            nextTaskInfo.style.display = 'block';
            nextTaskName.textContent = nextTask.name;
          } else {
            nextTaskInfo.style.display = 'block';
            nextTaskName.textContent = 'No more tasks available';
          }
        }
      });
    } else {
      // Show full interaction - ask if task is completed
      taskQuestion.style.display = 'block';
      nextTaskInfo.style.display = 'none';
    }
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
  // Use the task that was actually worked on (lastSessionTask or currentTask)
  const taskToComplete = lastSessionTask || currentTask;
  
  if (taskToComplete) {
    // Mark the last session task as completed and wait for response
    chrome.runtime.sendMessage({
      command: 'updateTaskStatus',
      taskId: taskToComplete.id,
      status: 'completed'
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error marking task complete:', chrome.runtime.lastError.message);
        return;
      }
      
      if (response && response.success) {
        console.log('Task marked as completed successfully');
        // Hide question, show next task info
        document.querySelector('.task-question').style.display = 'none';
        showNextTask();
      } else {
        console.error('Failed to mark task complete:', response ? response.error : 'No response');
      }
    });
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
  const taskToContinue = lastSessionTask || currentTask;
  document.getElementById('continueOptions').style.display = 'none';
  document.getElementById('nextTaskInfo').style.display = 'block';
  document.getElementById('nextTaskName').textContent = taskToContinue ? taskToContinue.name : 'No task';
}

// Handle move to next task
function handleMoveToNext() {
  // Use the task that was actually worked on (lastSessionTask or currentTask)
  const taskToComplete = lastSessionTask || currentTask;
  
  if (taskToComplete) {
    // Mark the last session task as completed and wait for response
    chrome.runtime.sendMessage({
      command: 'updateTaskStatus',
      taskId: taskToComplete.id,
      status: 'completed'
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error marking task complete:', chrome.runtime.lastError.message);
        return;
      }
      
      if (response && response.success) {
        console.log('Task marked as completed successfully');
        // Hide continue options, show next task
        document.getElementById('continueOptions').style.display = 'none';
        showNextTask();
      } else {
        console.error('Failed to mark task complete:', response ? response.error : 'No response');
      }
    });
  }
}

// Show next available task
function showNextTask() {
  // Find the next pending task
  const nextTask = allTasks.find(task => task.status === 'pending');
  
  if (nextTask) {
    // Set next task as in-progress and wait for response
    chrome.runtime.sendMessage({
      command: 'updateTaskStatus',
      taskId: nextTask.id,
      status: 'in-progress'
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error setting next task status:', chrome.runtime.lastError.message);
        return;
      }
      
      if (response && response.success) {
        // Set as current task in background
        chrome.runtime.sendMessage({
          command: 'setCurrentTask',
          task: nextTask
        }, (setResponse) => {
          if (chrome.runtime.lastError) {
            console.error('Error setting current task:', chrome.runtime.lastError.message);
          }
          
          // Update display
          document.getElementById('nextTaskInfo').style.display = 'block';
          document.getElementById('nextTaskName').textContent = nextTask.name;
          console.log('Next task set successfully:', nextTask.name);
        });
      } else {
        console.error('Failed to set next task status:', response ? response.error : 'No response');
      }
    });
  } else {
    // No more tasks
    document.getElementById('nextTaskInfo').style.display = 'block';
    document.getElementById('nextTaskName').textContent = 'No more tasks available';
  }
}

// Finish break early and start next session
function finishBreak() {
  chrome.runtime.sendMessage({ command: 'finishBreak' }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Error finishing break:', chrome.runtime.lastError.message);
    } else if (response && response.success) {
      console.log('Break finished successfully, starting work session');
      // Break tab will be closed by background script
    } else {
      console.error('Failed to finish break:', response ? response.error : 'No response');
    }
  });
}

// Start next session (manual mode)
function startNextSession() {
  chrome.runtime.sendMessage({ command: 'startNextSession' }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Error starting next session:', chrome.runtime.lastError.message);
    } else if (response && response.success) {
      console.log('Next session started successfully');
      // Break tab will be closed by background script
    } else {
      console.error('Failed to start next session:', response ? response.error : 'No response');
    }
  });
}

// Update timer display every second
setInterval(() => {
  updateTimer();
  updateElapsedTime();
}, 1000);