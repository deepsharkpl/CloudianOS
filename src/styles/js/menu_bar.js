async function updateDateTime() {
  try {
    const response = await fetch('/api/system/time');
    const data = await response.json();

    document.getElementById('date').textContent = data.date;
    document.getElementById('time').textContent = data.time;
  } catch (error) {
    console.error('Failed to fetch time:', error);
  }
}

updateDateTime();

setInterval(updateDateTime, 1000);
