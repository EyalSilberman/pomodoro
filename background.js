let timer;
let timeLeft;
let isBreak = false;
let autoRestart = false;
let sessionStartTime;
let sessionInitialTime;
let currentTask = null;
let lastSessionTask = null;
let taskCompletedEarly = false;
let breakEndTime = null; // Track when break ended for countdown

// Initialize current task from storage on startup
chrome.storage.local.get(['tasks'], (result) => {
  const tasks = result.tasks || [];
  const inProgressTask = tasks.find(task => task.status === 'in-progress');
  if (inProgressTask) {
    currentTask = inProgressTask;
  }
});

// Google Sheets logging function
async function logSession(sessionType, startTime, endTime, duration, completed) {
  try {
    const settings = await chrome.storage.sync.get(['webAppUrl', 'secretKey', 'enableLogging']);
    
    // Check if logging is enabled
    if (settings.enableLogging === false) {
      console.log('Session logging disabled, skipping log');
      return;
    }
    
    if (!settings.webAppUrl || !settings.secretKey) {
      console.log('Google Sheets not configured, skipping log');
      return;
    }
    
    // Get task name for work sessions
    const taskName = (sessionType === 'Work' && currentTask) ? currentTask.name : 'No task';
    
    const logData = [
      new Date(startTime).toLocaleDateString(),
      new Date(startTime).toLocaleTimeString(),
      new Date(endTime).toLocaleTimeString(),
      sessionType,
      Math.round(duration / 60), // Duration in minutes
      completed ? 'Yes' : 'No',
      taskName
    ];
    
    const response = await fetch(settings.webAppUrl, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        secret: settings.secretKey,
        data: logData
      })
    });
    
    const result = await response.json();
    
    if (result.status === 'success') {
      console.log('Session logged successfully:', logData);
    } else {
      console.error('Failed to log session:', result.message);
    }
    
  } catch (error) {
    console.error('Error logging session:', error);
  }
}

// Google Sheets task fetching function
async function fetchTasks(sheetName) {
  try {
    const settings = await chrome.storage.sync.get(['webAppUrl', 'secretKey']);
    
    if (!settings.webAppUrl || !settings.secretKey) {
      throw new Error('Google Sheets not configured');
    }
    
    const response = await fetch(settings.webAppUrl, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        secret: settings.secretKey,
        action: 'getTasks',
        sheetName: sheetName
      })
    });
    
    const result = await response.json();
    
    if (result.status === 'success') {
      // Initialize task statuses - ensure each task has a status and ID
      const initializedTasks = result.tasks.map((task, index) => ({
        ...task,
        id: task.id || `task_${index}_${Date.now()}`,
        status: task.status || 'pending'
      }));
      
      // Ensure only one task is in-progress (first one wins if multiple)
      let hasInProgress = false;
      initializedTasks.forEach(task => {
        if (task.status === 'in-progress') {
          if (hasInProgress) {
            task.status = 'pending';
          } else {
            hasInProgress = true;
            currentTask = task;
          }
        }
      });
      
      // If no task is in-progress, make the first task current by default
      if (!hasInProgress && initializedTasks.length > 0) {
        initializedTasks[0].status = 'in-progress';
        currentTask = initializedTasks[0];
      }
      
      // Store tasks in local storage
      await chrome.storage.local.set({ 
        tasks: initializedTasks,
        taskSheetName: sheetName 
      });
      return { success: true, tasks: initializedTasks };
    } else {
      throw new Error(result.message || 'Failed to fetch tasks');
    }
    
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return { success: false, error: error.message };
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.command === 'startTimer') {
    startTimer();
  } else if (message.command === 'pauseTimer') {
    pauseTimer();
  } else if (message.command === 'resetTimer') {
    resetTimer();
  } else if (message.command === 'setAutoRestart') {
    autoRestart = message.value;
  } else if (message.command === 'getState') {
    // Send current state to popup/break page
    const response = {
      timeLeft: timeLeft,
      isBreak: isBreak,
      isRunning: timer !== undefined
    };
    
    // If this is for the break page, also include task info and completion status
    if (isBreak) {
      // Send the last session task (what user actually worked on)
      if (lastSessionTask) {
        response.lastSessionTask = lastSessionTask;
      }
      // Send the current task (what they'll work on next)
      if (currentTask) {
        response.task = currentTask;
      }
      response.taskCompletedEarly = taskCompletedEarly;
      response.autoRestart = autoRestart;
      response.breakEndTime = breakEndTime;
    }
    
    chrome.runtime.sendMessage(response);
  } else if (message.command === 'getTasks') {
    // Get tasks from storage and send response
    chrome.storage.local.get(['tasks'], (result) => {
      sendResponse({ tasks: result.tasks || [] });
    });
    return true; // Keep message channel open for async response
  } else if (message.command === 'loadTasks') {
    // Load tasks from Google Sheets
    fetchTasks(message.sheetName).then(result => {
      sendResponse(result);
    });
    return true; // Keep message channel open for async response
  } else if (message.command === 'updateTaskStatus') {
    // Update task status in storage
    chrome.storage.local.get(['tasks'], (result) => {
      const tasks = result.tasks || [];
      const taskIndex = tasks.findIndex(task => task.id === message.taskId);
      
      if (taskIndex !== -1) {
        tasks[taskIndex].status = message.status;
        chrome.storage.local.set({ tasks: tasks }, () => {
          sendResponse({ success: true });
        });
      } else {
        sendResponse({ success: false, error: 'Task not found' });
      }
    });
    return true; // Keep message channel open for async response
  } else if (message.command === 'setCurrentTask') {
    // Set current task
    currentTask = message.task;
    sendResponse({ success: true });
    return true; // Keep message channel open for async response
  } else if (message.command === 'getCurrentTask') {
    // Get current task
    sendResponse({ task: currentTask });
    return true; // Keep message channel open
  } else if (message.command === 'markTaskComplete') {
    // Mark current task as completed and set next task as current
    if (currentTask) {
      chrome.storage.local.get(['tasks'], (result) => {
        const tasks = result.tasks || [];
        const taskIndex = tasks.findIndex(task => task.id === currentTask.id);
        
        if (taskIndex !== -1) {
          // Store the last session task before changing currentTask
          lastSessionTask = currentTask;
          
          // Mark current task as completed
          tasks[taskIndex].status = 'completed';
          
          // Find next pending task and make it in-progress
          const nextTask = tasks.find(task => task.status === 'pending');
          if (nextTask) {
            nextTask.status = 'in-progress';
            currentTask = nextTask;
          } else {
            currentTask = null;
          }
          
          // Save updated tasks and mark that task was completed early
          taskCompletedEarly = true;
          chrome.storage.local.set({ tasks: tasks }, () => {
            sendResponse({ success: true, nextTask: currentTask });
          });
        } else {
          sendResponse({ success: false, error: 'Task not found' });
        }
      });
    } else {
      sendResponse({ success: false, error: 'No current task' });
    }
    return true; // Keep message channel open for async response
  } else if (message.command === 'forceBreak') {
    // Force break for testing - end current session and start break
    if (timer) {
      clearInterval(timer);
      timer = undefined;
      
      // Log incomplete session if there was one
      if (sessionStartTime) {
        const endTime = Date.now();
        const duration = sessionInitialTime - timeLeft;
        const sessionType = isBreak ? 'Break' : 'Work';
        logSession(sessionType, sessionStartTime, endTime, duration, false);
        sessionStartTime = null;
      }
      
      // Start break
      isBreak = true;
      timeLeft = 300; // 5 minutes
      sessionStartTime = null;
      
      // Send task completion info to break page
      createBreakTab();
      startTimer(); // Start break timer
      
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: 'No timer running' });
    }
    return true; // Keep message channel open for async response
  } else if (message.command === 'finishBreak') {
    // Finish break early and start next work session
    if (isBreak && timer) {
      clearInterval(timer);
      timer = undefined;
      
      // End break session
      isBreak = false;
      timeLeft = 1500; // 25 minutes
      sessionStartTime = null;
      taskCompletedEarly = false; // Reset completion flag
      lastSessionTask = null; // Reset last session task
      
      // Close break tab
      chrome.tabs.query({ url: chrome.runtime.getURL("break.html") }, (tabs) => {
        tabs.forEach(tab => chrome.tabs.remove(tab.id));
      });
      
      // Start next work session automatically
      startTimer();
      
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: 'Not in break mode' });
    }
    return true; // Keep message channel open for async response
  } else if (message.command === 'startNextSession') {
    // Start next work session from break page
    if (isBreak) {
      clearInterval(timer);
      timer = undefined;
      
      // End break session
      isBreak = false;
      timeLeft = 1500; // 25 minutes
      sessionStartTime = null;
      taskCompletedEarly = false; // Reset completion flag
      lastSessionTask = null; // Reset last session task
      breakEndTime = null; // Reset break end time
      
      // Close break tab
      chrome.tabs.query({ url: chrome.runtime.getURL("break.html") }, (tabs) => {
        tabs.forEach(tab => chrome.tabs.remove(tab.id));
      });
      
      // Start next work session
      startTimer();
      
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: 'Not in break mode' });
    }
    return true; // Keep message channel open for async response
  }
});

// Function to update badge and send state to popup
function updateTimerDisplay(time) {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  
  // Update badge
  chrome.action.setBadgeText({ text: display });
  chrome.action.setBadgeBackgroundColor({ color: isBreak ? '#FF0000' : '#4CAF50' });
  
  // Send update to popup
  chrome.runtime.sendMessage({
    timeLeft: time,
    isBreak: isBreak,
    isRunning: true
  });
}

function startTimer() {
  if (timer) clearInterval(timer);
  
  if (!timeLeft) {
    timeLeft = isBreak ? 300 : 1500; // 5 minutes or 25 minutes
  }
  
  // Start session tracking
  if (!sessionStartTime) {
    sessionStartTime = Date.now();
    sessionInitialTime = timeLeft;
    
    // For work sessions, ensure we have a current task
    if (!isBreak && !currentTask) {
      // Try to find an in-progress task
      chrome.storage.local.get(['tasks'], (result) => {
        const tasks = result.tasks || [];
        const inProgressTask = tasks.find(task => task.status === 'in-progress');
        if (inProgressTask) {
          currentTask = inProgressTask;
        }
      });
    }
  }
  
  updateTimerDisplay(timeLeft);
  
  timer = setInterval(() => {
    timeLeft--;
    updateTimerDisplay(timeLeft);
    
    if (timeLeft <= 0) {
      clearInterval(timer);
      timer = undefined;
      
      // Log completed session
      if (sessionStartTime) {
        const endTime = Date.now();
        const duration = sessionInitialTime; // Duration in seconds
        const sessionType = isBreak ? 'Break' : 'Work';
        logSession(sessionType, sessionStartTime, endTime, duration, true);
      }
      
      if (!isBreak) {
        // Work session ended, start break
        lastSessionTask = currentTask; // Store the task that was worked on
        isBreak = true;
        timeLeft = 300; // 5 minutes
        sessionStartTime = null; // Reset for next session
        createBreakTab();
        startTimer(); // Start break timer
      } else {
        // Break ended
        if (autoRestart) {
          // Auto mode - end break immediately and start work
          isBreak = false;
          timeLeft = 1500; // 25 minutes
          sessionStartTime = null; // Reset for next session
          taskCompletedEarly = false; // Reset completion flag
          lastSessionTask = null; // Reset last session task
          
          // Close break tab and start immediately
          chrome.tabs.query({ url: chrome.runtime.getURL("break.html") }, (tabs) => {
            tabs.forEach(tab => chrome.tabs.remove(tab.id));
            setTimeout(() => {
              startTimer();
            }, 500);
          });
        } else {
          // Manual restart mode - stay in break state until user starts next session
          breakEndTime = Date.now();
          timeLeft = 0; // Break timer finished, but still in break mode
          // Keep isBreak = true so break tab can start next session
          // Don't close break tab - user will manually start next session
        }
      }
    }
  }, 1000);
}

function pauseTimer() {
  if (timer) {
    clearInterval(timer);
    timer = undefined;
    chrome.runtime.sendMessage({ isRunning: false });
    
    // Log incomplete session when paused
    if (sessionStartTime) {
      const endTime = Date.now();
      const duration = sessionInitialTime - timeLeft; // Time actually worked
      const sessionType = isBreak ? 'Break' : 'Work';
      logSession(sessionType, sessionStartTime, endTime, duration, false);
      sessionStartTime = null; // Reset session tracking
    }
  }
}

function resetTimer() {
  clearInterval(timer);
  timer = undefined;
  
  // Log incomplete session when reset
  if (sessionStartTime) {
    const endTime = Date.now();
    const duration = sessionInitialTime - timeLeft; // Time actually worked
    const sessionType = isBreak ? 'Break' : 'Work';
    logSession(sessionType, sessionStartTime, endTime, duration, false);
    sessionStartTime = null; // Reset session tracking
  }
  
  isBreak = false;
  timeLeft = 1500;
  taskCompletedEarly = false; // Reset completion flag
  lastSessionTask = null; // Reset last session task
  breakEndTime = null; // Reset break end time
  updateTimerDisplay(timeLeft);
}

function createBreakTab() {
  chrome.tabs.create({
    url: 'break.html',
    active: true
  });
}