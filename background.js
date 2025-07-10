let timer;
let timeLeft;
let isBreak = false;
let autoRestart = true;
let sessionStartTime;
let sessionInitialTime;

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
    
    const logData = [
      new Date(startTime).toLocaleDateString(),
      new Date(startTime).toLocaleTimeString(),
      new Date(endTime).toLocaleTimeString(),
      sessionType,
      Math.round(duration / 60), // Duration in minutes
      completed ? 'Yes' : 'No'
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

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message) => {
  if (message.command === 'startTimer') {
    startTimer();
  } else if (message.command === 'pauseTimer') {
    pauseTimer();
  } else if (message.command === 'resetTimer') {
    resetTimer();
  } else if (message.command === 'setAutoRestart') {
    autoRestart = message.value;
  } else if (message.command === 'getState') {
    // Send current state to popup
    chrome.runtime.sendMessage({
      timeLeft: timeLeft,
      isBreak: isBreak,
      isRunning: timer !== undefined
    });
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
        isBreak = true;
        timeLeft = 300; // 5 minutes
        sessionStartTime = null; // Reset for next session
        createBreakTab();
        startTimer(); // Start break timer
      } else {
        // Break ended
        isBreak = false;
        timeLeft = 1500; // 25 minutes
        sessionStartTime = null; // Reset for next session
        
        // Close break tab
        chrome.tabs.query({ url: chrome.runtime.getURL("break.html") }, (tabs) => {
          tabs.forEach(tab => chrome.tabs.remove(tab.id));
          
          // Auto-restart new work session if enabled
          if (autoRestart) {
            setTimeout(() => {
              startTimer();
            }, 500);
          }
        });
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
  updateTimerDisplay(timeLeft);
}

function createBreakTab() {
  chrome.tabs.create({
    url: 'break.html',
    active: true
  });
}