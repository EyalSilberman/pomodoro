document.addEventListener('DOMContentLoaded', function() {
    // Get initial state
    chrome.runtime.sendMessage({ command: 'getState' });
    
    // Initialize auto-restart checkbox
    chrome.storage.local.get(['autoRestart'], function(result) {
      document.getElementById('autoRestartCheckbox').checked = result.autoRestart !== false;
    });
    
    // Load saved settings and initialize UI
    chrome.storage.sync.get(['webAppUrl', 'secretKey', 'enableLogging'], function(result) {
      // Load logging toggle state
      const enableLogging = result.enableLogging !== false; // Default to true
      document.getElementById('enableLoggingCheckbox').checked = enableLogging;
      
      // Load saved credentials
      if (result.webAppUrl) {
        document.getElementById('webAppUrl').value = result.webAppUrl;
      }
      if (result.secretKey) {
        document.getElementById('secretKey').value = result.secretKey;
      }
      
      // Initialize UI state
      updateLoggingConfigVisibility();
      updateSettingsVisibility();
      updateLoggingConfigState();
    });
    
    // Task Manager functionality
    document.getElementById('taskManagerBtn').addEventListener('click', () => {
      const taskConfigContainer = document.getElementById('taskConfigContainer');
      taskConfigContainer.classList.toggle('hidden');
    });

    // Load tasks functionality
    document.getElementById('loadTasksBtn').addEventListener('click', async () => {
      const sheetName = document.getElementById('sheetName').value.trim();
      const loadingIndicator = document.getElementById('loadingIndicator');
      const taskStatusMessage = document.getElementById('taskStatusMessage');
      const loadTasksBtn = document.getElementById('loadTasksBtn');
      const viewTasksBtn = document.getElementById('viewTasksBtn');
      
      if (!sheetName) {
        taskStatusMessage.textContent = 'Please enter a sheet name.';
        taskStatusMessage.style.color = '#FF4444';
        setTimeout(() => taskStatusMessage.textContent = '', 3000);
        return;
      }
      
      // Check if Google Sheets is configured
      const settings = await chrome.storage.sync.get(['webAppUrl', 'secretKey', 'enableLogging']);
      if (!settings.webAppUrl || !settings.secretKey) {
        taskStatusMessage.textContent = 'Please configure Google Sheets settings first.';
        taskStatusMessage.style.color = '#FF4444';
        setTimeout(() => taskStatusMessage.textContent = '', 3000);
        return;
      }
      
      // Show loading indicator
      loadingIndicator.classList.add('show');
      loadTasksBtn.disabled = true;
      taskStatusMessage.textContent = '';
      
      try {
        // Send message to background script to load tasks
        chrome.runtime.sendMessage({ 
          command: 'loadTasks', 
          sheetName: sheetName 
        }, (result) => {
          if (result.success) {
            taskStatusMessage.textContent = `${result.tasks.length} tasks loaded successfully!`;
            taskStatusMessage.style.color = '#4CAF50';
            viewTasksBtn.classList.remove('hidden');
            
            setTimeout(() => taskStatusMessage.textContent = '', 3000);
          } else {
            taskStatusMessage.textContent = result.error || 'Failed to load tasks.';
            taskStatusMessage.style.color = '#FF4444';
            setTimeout(() => taskStatusMessage.textContent = '', 3000);
          }
          
          loadingIndicator.classList.remove('show');
          loadTasksBtn.disabled = false;
        });
        
      } catch (error) {
        console.error('Error loading tasks:', error);
        taskStatusMessage.textContent = 'Error loading tasks. Check console for details.';
        taskStatusMessage.style.color = '#FF4444';
        setTimeout(() => taskStatusMessage.textContent = '', 3000);
        
        loadingIndicator.classList.remove('show');
        loadTasksBtn.disabled = false;
      }
    });

    // View tasks functionality
    document.getElementById('viewTasksBtn').addEventListener('click', () => {
      chrome.tabs.create({ url: 'tasks.html' });
    });
  });
  
  // Listen for timer updates from background
  chrome.runtime.onMessage.addListener((message) => {
    if (message.timeLeft !== undefined) {
      updateDisplay(message.timeLeft, message.isBreak, message.isRunning);
    }
  });
  
  // Update display function
  function updateDisplay(timeLeft, isBreak, isRunning) {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Update timer display
    const timer = document.getElementById('timer');
    timer.textContent = display;
    timer.style.color = isBreak ? '#FF4444' : '#4CAF50';
    
    // Update start/pause button
    const startBtn = document.getElementById('startBtn');
    startBtn.textContent = isRunning ? 'Pause' : (isBreak ? 'Break' : 'Start');
  }
  
  // Start/Pause button
  document.getElementById('startBtn').addEventListener('click', () => {
    const startBtn = document.getElementById('startBtn');
    if (startBtn.textContent === 'Pause') {
      chrome.runtime.sendMessage({ command: 'pauseTimer' });
      startBtn.textContent = 'Resume';
    } else {
      chrome.runtime.sendMessage({ command: 'startTimer' });
      startBtn.textContent = 'Pause';
    }
  });
  
  // Reset button
  document.getElementById('resetBtn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ command: 'resetTimer' });
    document.getElementById('startBtn').textContent = 'Start';
  });
  
  
  // Save Google Sheets settings
  document.getElementById('saveSettingsBtn').addEventListener('click', () => {
    const webAppUrl = document.getElementById('webAppUrl').value.trim();
    const secretKey = document.getElementById('secretKey').value.trim();
    const enableLogging = document.getElementById('enableLoggingCheckbox').checked;
    const statusMessage = document.getElementById('statusMessage');
    
    if (!enableLogging || (webAppUrl && secretKey)) {
      chrome.storage.sync.set({ 
        webAppUrl: webAppUrl, 
        secretKey: secretKey, 
        enableLogging: enableLogging 
      }, () => {
        statusMessage.textContent = 'Settings saved!';
        statusMessage.style.color = '#4CAF50';
        setTimeout(() => {
          statusMessage.textContent = '';
          updateSettingsVisibility(); // Hide settings form after successful save
        }, 2000);
      });
    } else {
      statusMessage.textContent = 'Please fill in both URL and Secret Key when logging is enabled.';
      statusMessage.style.color = '#FF4444';
      setTimeout(() => statusMessage.textContent = '', 3000);
    }
  });
  
  // Auto-restart checkbox
  document.getElementById('autoRestartCheckbox').addEventListener('change', (e) => {
    const autoRestart = e.target.checked;
    chrome.storage.local.set({ autoRestart });
    chrome.runtime.sendMessage({ command: 'setAutoRestart', value: autoRestart });
  });
  
  // Settings toggle button
  document.getElementById('settingsToggle').addEventListener('click', () => {
    const settingsContainer = document.getElementById('settingsContainer');
    const settingsToggle = document.getElementById('settingsToggle');
    const editSettingsBtn = document.getElementById('editSettingsBtn');
    
    if (settingsContainer.classList.contains('hidden')) {
      // Show settings
      settingsContainer.classList.remove('hidden');
    } else {
      // Hide settings and check if we should show edit button
      settingsContainer.classList.add('hidden');
      
      // Check if user has saved settings to determine which button to show
      chrome.storage.sync.get(['webAppUrl', 'secretKey', 'enableLogging'], function(result) {
        const hasSettings = result.webAppUrl && result.secretKey;
        const enableLogging = result.enableLogging !== false;
        
        if (hasSettings && enableLogging) {
          settingsToggle.classList.add('hidden');
          editSettingsBtn.classList.remove('hidden');
        }
      });
    }
  });
  
  // Edit settings button
  document.getElementById('editSettingsBtn').addEventListener('click', () => {
    document.getElementById('settingsContainer').classList.remove('hidden');
    document.getElementById('settingsToggle').classList.remove('hidden');
    document.getElementById('editSettingsBtn').classList.add('hidden');
  });
  
  // Enable logging checkbox
  document.getElementById('enableLoggingCheckbox').addEventListener('change', (e) => {
    updateLoggingConfigState();
    // Save state immediately
    chrome.storage.sync.set({ enableLogging: e.target.checked });
  });

// Helper functions
function updateLoggingConfigVisibility() {
  // This function can be used for future enhancements
}

function updateLoggingConfigState() {
  const enableLogging = document.getElementById('enableLoggingCheckbox').checked;
  const configSection = document.getElementById('loggingConfigSection');
  
  if (enableLogging) {
    configSection.classList.remove('disabled');
  } else {
    configSection.classList.add('disabled');
  }
}

function updateSettingsVisibility() {
  chrome.storage.sync.get(['webAppUrl', 'secretKey', 'enableLogging'], function(result) {
    const hasSettings = result.webAppUrl && result.secretKey;
    const enableLogging = result.enableLogging !== false;
    
    const settingsToggle = document.getElementById('settingsToggle');
    const editSettingsBtn = document.getElementById('editSettingsBtn');
    const settingsContainer = document.getElementById('settingsContainer');
    
    if (hasSettings && enableLogging) {
      // Settings are configured, show compact view
      settingsToggle.classList.add('hidden');
      editSettingsBtn.classList.remove('hidden');
      settingsContainer.classList.add('hidden');
    } else {
      // Settings not configured, show setup button
      settingsToggle.classList.remove('hidden');
      editSettingsBtn.classList.add('hidden');
      settingsContainer.classList.remove('hidden');
    }
  });
}