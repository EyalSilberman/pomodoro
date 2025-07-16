document.addEventListener('DOMContentLoaded', function() {
  loadTasks();
  
  // Refresh button functionality
  document.getElementById('refreshBtn').addEventListener('click', refreshTasks);
});

// Load tasks from storage and display them
async function loadTasks() {
  try {
    const result = await chrome.storage.local.get(['tasks', 'taskSheetName']);
    const tasks = result.tasks || [];
    
    displayTasks(tasks);
    updateStatistics(tasks);
    
  } catch (error) {
    console.error('Error loading tasks:', error);
    showNoTasks('Error loading tasks from storage.');
  }
}

// Display tasks in the list
function displayTasks(tasks) {
  const taskList = document.getElementById('taskList');
  
  if (!tasks || tasks.length === 0) {
    showNoTasks('No tasks loaded. Please load tasks from the popup.');
    return;
  }
  
  let html = '';
  tasks.forEach((task, index) => {
    html += `
      <div class="task-item ${task.status}" data-task-id="${task.id}">
        <div class="task-index">${index + 1}</div>
        <div class="task-status ${task.status}"></div>
        <div class="task-content">
          <div class="task-name">${escapeHtml(task.name)}</div>
          <div class="task-description">${escapeHtml(task.description)}</div>
        </div>
        <div class="task-actions">
          <button class="status-btn" onclick="toggleTaskStatus('${task.id}')">
            ${getStatusButtonText(task.status)}
          </button>
        </div>
      </div>
    `;
  });
  
  taskList.innerHTML = html;
}

// Show no tasks message
function showNoTasks(message) {
  const taskList = document.getElementById('taskList');
  taskList.innerHTML = `<div class="no-tasks">${message}</div>`;
}

// Update statistics
function updateStatistics(tasks) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
  
  document.getElementById('totalTasks').textContent = totalTasks;
  document.getElementById('completedTasks').textContent = completedTasks;
  document.getElementById('pendingTasks').textContent = pendingTasks + inProgressTasks;
}

// Toggle task status
async function toggleTaskStatus(taskId) {
  try {
    const result = await chrome.storage.local.get(['tasks']);
    const tasks = result.tasks || [];
    
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return;
    
    const currentStatus = tasks[taskIndex].status;
    let newStatus;
    
    switch (currentStatus) {
      case 'pending':
        newStatus = 'in-progress';
        break;
      case 'in-progress':
        newStatus = 'completed';
        break;
      case 'completed':
        newStatus = 'pending';
        break;
      default:
        newStatus = 'pending';
    }
    
    tasks[taskIndex].status = newStatus;
    
    // Save updated tasks
    await chrome.storage.local.set({ tasks: tasks });
    
    // Refresh display
    displayTasks(tasks);
    updateStatistics(tasks);
    
  } catch (error) {
    console.error('Error updating task status:', error);
  }
}

// Get status button text
function getStatusButtonText(status) {
  switch (status) {
    case 'pending':
      return 'Start';
    case 'in-progress':
      return 'Complete';
    case 'completed':
      return 'Reset';
    default:
      return 'Start';
  }
}

// Refresh tasks from Google Sheets
async function refreshTasks() {
  try {
    const settings = await chrome.storage.sync.get(['webAppUrl', 'secretKey']);
    const localData = await chrome.storage.local.get(['taskSheetName']);
    
    if (!settings.webAppUrl || !settings.secretKey) {
      showNoTasks('Google Sheets not configured. Please set up in the popup.');
      return;
    }
    
    if (!localData.taskSheetName) {
      showNoTasks('No sheet name configured. Please load tasks from the popup first.');
      return;
    }
    
    // Show loading
    document.getElementById('taskList').innerHTML = '<div class="loading">Refreshing tasks...</div>';
    
    const url = `${settings.webAppUrl}?secret=${encodeURIComponent(settings.secretKey)}&action=getTasks&sheetName=${encodeURIComponent(localData.taskSheetName)}`;
    
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache'
    });
    
    const result = await response.json();
    
    if (result.status === 'success') {
      // Preserve existing task statuses by merging with fresh data
      const existingTasks = (await chrome.storage.local.get(['tasks'])).tasks || [];
      const newTasks = result.tasks.map(newTask => {
        const existingTask = existingTasks.find(existing => existing.name === newTask.name);
        return {
          ...newTask,
          status: existingTask ? existingTask.status : 'pending'
        };
      });
      
      // Save updated tasks
      await chrome.storage.local.set({ tasks: newTasks });
      
      // Refresh display
      displayTasks(newTasks);
      updateStatistics(newTasks);
      
    } else {
      showNoTasks(`Error refreshing tasks: ${result.message}`);
    }
    
  } catch (error) {
    console.error('Error refreshing tasks:', error);
    showNoTasks('Error refreshing tasks. Check console for details.');
  }
}

// Utility function to escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Make toggleTaskStatus available globally
window.toggleTaskStatus = toggleTaskStatus;