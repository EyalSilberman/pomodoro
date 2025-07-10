document.addEventListener('DOMContentLoaded', function() {
    loadLogs();
    
    document.getElementById('exportBtn').addEventListener('click', exportLogs);
  });
  
  function loadLogs() {
    chrome.storage.local.get(['sessionLogs'], function(result) {
      const logs = result.sessionLogs || [];
      displayStats(logs);
      displayLogs(logs);
    });
  }
  
  function displayStats(logs) {
    const stats = calculateStats(logs);
    const statsContainer = document.getElementById('statsContainer');
    
    statsContainer.innerHTML = `
      <h3>Statistics</h3>
      <p>Total Sessions: ${stats.totalSessions}</p>
      <p>Completed Work Sessions: ${stats.completedWorkSessions}</p>
      <p>Completed Break Sessions: ${stats.completedBreakSessions}</p>
      <p>Total Work Time: ${formatMinutes(stats.totalWorkMinutes)} hours</p>
    `;
  }
  
  function calculateStats(logs) {
    return {
      totalSessions: logs.length,
      completedWorkSessions: logs.filter(log => log.type === 'work' && log.completed).length,
      completedBreakSessions: logs.filter(log => log.type === 'break' && log.completed).length,
      totalWorkMinutes: logs
        .filter(log => log.type === 'work' && log.completed)
        .reduce((total, log) => total + (log.duration / 60), 0)
    };
  }
  
  function displayLogs(logs) {
    const tbody = document.getElementById('logsTableBody');
    tbody.innerHTML = '';
    
    logs.reverse().forEach(log => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${new Date(log.startTime).toLocaleString()}</td>
        <td>${log.type}</td>
        <td>${log.duration / 60} minutes</td>
        <td>${log.completed ? '✅' : '❌'}</td>
      `;
      tbody.appendChild(row);
    });
  }
  
  function exportLogs() {
    chrome.storage.local.get(['sessionLogs'], function(result) {
      const logs = result.sessionLogs || [];
      const csv = convertToCSV(logs);
      downloadCSV(csv);
    });
  }
  
  function convertToCSV(logs) {
    const headers = ['Start Time', 'End Time', 'Type', 'Duration (minutes)', 'Completed'];
    const rows = logs.map(log => [
      log.startTime,
      log.endTime,
      log.type,
      log.duration / 60,
      log.completed
    ]);
    
    return [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
  }
  
  function downloadCSV(csv) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'pomodoro-logs.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  
  function formatMinutes(minutes) {
    return (minutes / 60).toFixed(1);
  }