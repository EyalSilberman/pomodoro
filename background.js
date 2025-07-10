let timer;
let timeLeft;
let isBreak = false;
let autoRestart = true;

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
  
  updateTimerDisplay(timeLeft);
  
  timer = setInterval(() => {
    timeLeft--;
    updateTimerDisplay(timeLeft);
    
    if (timeLeft <= 0) {
      clearInterval(timer);
      timer = undefined;
      
      if (!isBreak) {
        // Work session ended, start break
        isBreak = true;
        timeLeft = 300; // 5 minutes
        createBreakTab();
        startTimer(); // Start break timer
      } else {
        // Break ended
        isBreak = false;
        timeLeft = 1500; // 25 minutes
        
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
  }
}

function resetTimer() {
  clearInterval(timer);
  timer = undefined;
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