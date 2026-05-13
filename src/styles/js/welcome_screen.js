const welcomes = [
  'Hello',
  'Witaj',
  'Bonjour',
  'Hola',
  'Ciao',
  'Hallo',
  'こんにちは',
  '안녕하세요',
  'Привет',
  'مرحبا',
  'שלום',
  'नमस्ते',
  'Olá',
];

const splash = document.querySelector('.splash-screen');
const setupScreen = document.querySelector('.setup-screen');
const welcomeText = document.getElementById('welcome-text');

let currentWord = 0;
let typingTimer = null;

setTimeout(() => {
  splash.classList.add('hide');
  setTimeout(() => {
    splash.style.display = 'none';
    setupScreen.classList.add('show');
    typeWelcome();
    typingTimer = setInterval(typeWelcome, 3500);
  }, 1200);
}, 6000);

function typeWelcome() {
  const word = welcomes[currentWord];
  welcomeText.innerHTML = '';
  let i = 0;
  const typing = setInterval(() => {
    welcomeText.innerHTML += word[i];
    i++;
    if (i >= word.length) {
      clearInterval(typing);
      setTimeout(eraseText, 1200);
    }
  }, 140);
  currentWord = (currentWord + 1) % welcomes.length;
}

function eraseText() {
  const text = welcomeText.innerHTML;
  let length = text.length;
  const erasing = setInterval(() => {
    welcomeText.innerHTML = text.substring(0, length - 1);
    length--;
    if (length < 0) clearInterval(erasing);
  }, 70);
}

const panels = document.querySelectorAll('.step-panel');
const sideSteps = document.querySelectorAll('.step');
let currentStep = 1;

function goToStep(n) {
  const current = document.querySelector(
    `.step-panel[data-panel="${currentStep}"]`,
  );
  if (current) {
    current.classList.remove('active');
    current.classList.add('exit');
    setTimeout(() => current.classList.remove('exit'), 400);
  }

  sideSteps.forEach((s) => {
    const sn = parseInt(s.dataset.step);
    s.classList.remove('active', 'done');
    if (sn === n) s.classList.add('active');
    if (sn < n) s.classList.add('done');
  });

  currentStep = n;
  const next = document.querySelector(`.step-panel[data-panel="${n}"]`);
  if (next) {
    setTimeout(() => next.classList.add('active'), 50);
  }
}

document.querySelectorAll('[data-go]').forEach((btn) => {
  btn.addEventListener('click', () => goToStep(parseInt(btn.dataset.go)));
});

async function post(endpoint, body) {
  const res = await fetch(`/api/configuration/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function get(endpoint) {
  const res = await fetch(`/api/configuration/${endpoint}`);
  return res.json();
}

function setLoading(btn, loading) {
  btn.disabled = loading;
  btn.classList.toggle('loading', loading);
  btn.textContent = loading ? 'Proszę czekać...' : btn.dataset.label;
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = msg;
    el.style.display = msg ? 'block' : 'none';
  }
}

document
  .getElementById('btn-welcome-next')
  .addEventListener('click', async () => {
    goToStep(2);
    loadLanguages();
  });

async function loadLanguages() {
  const data = await get('languages');
  const sel = document.getElementById('select-language');
  sel.innerHTML = '';
  data.languages.forEach((l) => {
    const opt = document.createElement('option');
    opt.value = l.code;
    opt.textContent = l.label;
    opt.dataset.region = l.region;
    opt.dataset.numberFormat = l.numberFormat;
    opt.dataset.dateFormat = l.dateFormat;
    if (l.code === 'pl') opt.selected = true;
    sel.appendChild(opt);
  });
  sel.dispatchEvent(new Event('change'));
}

document
  .getElementById('select-language')
  .addEventListener('change', function () {
    const opt = this.options[this.selectedIndex];
    if (opt) {
      document.getElementById('input-region').value = opt.dataset.region || '';
    }
  });

const btnLanguageNext = document.getElementById('btn-language-next');
btnLanguageNext.dataset.label = 'Kontynuuj';

btnLanguageNext.addEventListener('click', async () => {
  const sel = document.getElementById('select-language');
  const opt = sel.options[sel.selectedIndex];
  const region = document.getElementById('input-region').value.trim();

  setLoading(btnLanguageNext, true);
  const res = await post('language', {
    language: sel.value,
    region: region || opt?.dataset.region || 'PL',
    numberFormat: opt?.dataset.numberFormat || '1 234,56',
    dateFormat: opt?.dataset.dateFormat || 'DD.MM.YYYY',
  });
  setLoading(btnLanguageNext, false);

  if (res.success) {
    goToStep(3);
    loadKeyboardData();
  }
});

async function loadKeyboardData() {
  const [kbData, tzData] = await Promise.all([
    get('keyboard-layouts'),
    get('timezones'),
  ]);

  const kbSel = document.getElementById('select-keyboard');
  kbSel.innerHTML = '';
  kbData.layouts.forEach((l) => {
    const opt = document.createElement('option');
    opt.value = l.code;
    opt.textContent = l.label;
    if (l.code === 'pl') opt.selected = true;
    kbSel.appendChild(opt);
  });

  const tzSel = document.getElementById('select-timezone');
  tzSel.innerHTML = '';
  tzData.timezones.forEach((tz) => {
    const opt = document.createElement('option');
    opt.value = tz;
    opt.textContent = tz.replace('_', ' ');
    if (tz === 'Europe/Warsaw') opt.selected = true;
    tzSel.appendChild(opt);
  });
}

const btnKeyboardNext = document.getElementById('btn-keyboard-next');
btnKeyboardNext.dataset.label = 'Kontynuuj';

btnKeyboardNext.addEventListener('click', async () => {
  const keyboardLayout = document.getElementById('select-keyboard').value;
  const timezone = document.getElementById('select-timezone').value;
  const timeFormat =
    document.querySelector('input[name="timeFormat"]:checked')?.value || '24h';

  setLoading(btnKeyboardNext, true);
  const res = await post('keyboard', { keyboardLayout, timezone, timeFormat });
  setLoading(btnKeyboardNext, false);

  if (res.success) goToStep(4);
});

const wifiFields = document.querySelector('.wifi-fields');

document.querySelectorAll('input[name="networkType"]').forEach((radio) => {
  radio.addEventListener('change', () => {
    const isWifi = radio.value === 'wifi';
    wifiFields.classList.toggle('hidden', !isWifi);
  });
});

const btnNetworkNext = document.getElementById('btn-network-next');
btnNetworkNext.dataset.label = 'Kontynuuj';

btnNetworkNext.addEventListener('click', async () => {
  const type =
    document.querySelector('input[name="networkType"]:checked')?.value ||
    'none';
  const ssid = document.getElementById('input-ssid').value.trim();
  const wifiPass = document.getElementById('input-wifi-password').value;
  const autoConnect = document.getElementById('check-autoconnect').checked;

  setLoading(btnNetworkNext, true);
  const res = await post('network', {
    type,
    ssid: type === 'wifi' ? ssid : null,
    password: type === 'wifi' ? wifiPass : null,
    autoConnect: type === 'wifi' ? autoConnect : false,
  });
  setLoading(btnNetworkNext, false);

  if (res.success) goToStep(5);
});

const btnFinish = document.getElementById('btn-finish');
btnFinish.dataset.label = 'Zakończ instalację';

btnFinish.addEventListener('click', async () => {
  const device = document.getElementById('input-device').value.trim();
  const username = document.getElementById('input-username').value.trim();
  const password = document.getElementById('input-password').value;
  const password2 = document.getElementById('input-password-confirm').value;

  showError('finish-error', '');

  if (!device) return showError('finish-error', 'Podaj nazwę urządzenia.');
  if (!username) return showError('finish-error', 'Podaj nazwę użytkownika.');
  if (!password) return showError('finish-error', 'Podaj hasło.');
  if (password !== password2)
    return showError('finish-error', 'Hasła nie są zgodne.');
  if (password.length < 6)
    return showError('finish-error', 'Hasło musi mieć co najmniej 6 znaków.');

  setLoading(btnFinish, true);
  const res = await post('finish', { username, password, deviceName: device });
  setLoading(btnFinish, false);

  if (res.success) {
    if (typingTimer) clearInterval(typingTimer);
    window.location.href = res.redirect || '/';
  } else {
    showError('finish-error', res.error || 'Wystąpił błąd. Spróbuj ponownie.');
  }
});
