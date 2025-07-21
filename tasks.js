document.addEventListener('DOMContentLoaded', function() {
  loadTasks();
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
        // Ensure only one task can be in-progress at a time
        tasks.forEach((task, index) => {
          if (index !== taskIndex && task.status === 'in-progress') {
            task.status = 'pending';
          }
        });
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
    
    // Notify background script about current task change
    if (newStatus === 'in-progress') {
      chrome.runtime.sendMessage({ 
        command: 'setCurrentTask', 
        task: tasks[taskIndex] 
      });
    } else if (currentStatus === 'in-progress') {
      chrome.runtime.sendMessage({ 
        command: 'setCurrentTask', 
        task: null 
      });
    }
    
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


// Utility function to escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Make toggleTaskStatus available globally
window.toggleTaskStatus = toggleTaskStatus;