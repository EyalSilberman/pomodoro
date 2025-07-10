document.addEventListener('DOMContentLoaded', function() {
    // Get initial state
    chrome.runtime.sendMessage({ command: 'getState' });
    
    // Initialize auto-restart checkbox
    chrome.storage.local.get(['autoRestart'], function(result) {
      document.getElementById('autoRestartCheckbox').checked = result.autoRestart !== false;
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
  
  // View logs button
  document.getElementById('viewLogsBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: 'logs.html' });
  });
  
  // Auto-restart checkbox
  document.getElementById('autoRestartCheckbox').addEventListener('change', (e) => {
    const autoRestart = e.target.checked;
    chrome.storage.local.set({ autoRestart });
    chrome.runtime.sendMessage({ command: 'setAutoRestart', value: autoRestart });
  });