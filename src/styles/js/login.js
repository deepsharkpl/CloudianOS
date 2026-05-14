const clockEl = document.getElementById('clock');

function updateClock() {
  const now = new Date();
  const date = now.toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const time = now.toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
  });
  clockEl.textContent = `${date}  ${time}`;
}
updateClock();
setInterval(updateClock, 1000);

const usernameEl = document.getElementById('login-username');

function getCurrentUsername() {
  if (usernameEl.tagName === 'SELECT') return usernameEl.value;
  return usernameEl.dataset.username;
}

const input = document.getElementById('input-password');
const btnLogin = document.getElementById('btn-login');
const btnShow = document.getElementById('btn-show-pass');
const errorEl = document.getElementById('login-error');

btnShow.addEventListener('click', () => {
  input.type = input.type === 'password' ? 'text' : 'password';
});

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') btnLogin.click();
});

input.addEventListener('input', () => {
  errorEl.textContent = '';
});

btnLogin.addEventListener('click', async () => {
  const password = input.value;
  if (!password) return;

  btnLogin.disabled = true;
  btnLogin.classList.add('loading');
  btnLogin.textContent = 'Logowanie...';
  errorEl.textContent = '';

  const res = await fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: getCurrentUsername(), password }),
  });

  const data = await res.json();

  if (data.success) {
    window.location.href = '/';
  } else {
    btnLogin.disabled = false;
    btnLogin.classList.remove('loading');
    btnLogin.textContent = 'Zaloguj się';
    errorEl.textContent = data.error || 'Nieprawidłowe hasło.';
    input.value = '';
    input.focus();
  }
});

document.getElementById('btn-shutdown').addEventListener('click', () => {
  fetch('/api/system/shutdown', { method: 'POST' });
});

document.getElementById('btn-reboot').addEventListener('click', () => {
  fetch('/api/system/reboot', { method: 'POST' });
});
