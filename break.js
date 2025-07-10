let breakTimeLeft = 300; // 5 minutes in seconds

function updateTimer() {
  const minutes = Math.floor(breakTimeLeft / 60);
  const seconds = breakTimeLeft % 60;
  document.getElementById('breakTimer').textContent = 
    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  if (breakTimeLeft <= 0) {
    window.close();
  }
  breakTimeLeft--;
}

setInterval(updateTimer, 1000);