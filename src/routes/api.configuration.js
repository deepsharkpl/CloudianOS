const { createAccount } = require('../database/createAccount');

const express = require('express');
const router = express.Router();

let setupSession = {};

router.get('/status', async (req, res) => {
  try {
    res.json({
      success: true,
      step: setupSession.currentStep || 1,
      data: setupSession.data || {},
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/language', (req, res) => {
  const { language, region, numberFormat, dateFormat } = req.body;

  if (!language) {
    return res
      .status(400)
      .json({ success: false, error: 'Brak pola: language' });
  }

  setupSession.data = {
    ...setupSession.data,
    language,
    region: region || 'PL',
    numberFormat: numberFormat || '1 234,56',
    dateFormat: dateFormat || 'DD.MM.YYYY',
  };

  setupSession.currentStep = 3;

  res.json({ success: true, next: '/setup/keyboard' });
});

router.post('/keyboard', (req, res) => {
  const { keyboardLayout, timezone, timeFormat } = req.body;

  if (!keyboardLayout) {
    return res
      .status(400)
      .json({ success: false, error: 'Brak pola: keyboardLayout' });
  }

  setupSession.data = {
    ...setupSession.data,
    keyboardLayout,
    timezone: timezone || 'Europe/Warsaw',
    timeFormat: timeFormat || '24h',
  };

  setupSession.currentStep = 4;

  res.json({ success: true, next: '/setup/network' });
});

router.post('/network', (req, res) => {
  const { type, ssid, password, autoConnect } = req.body;

  setupSession.data = {
    ...setupSession.data,
    network: {
      type: type || 'none',
      ssid: ssid || null,
      password: password || null,
      autoConnect: autoConnect || false,
    },
  };

  setupSession.currentStep = 5;

  res.json({ success: true, next: '/setup/finish' });
});

router.post('/finish', async (req, res) => {
  const { username, password, deviceName, theme } = req.body;

  if (!username || !password || !deviceName) {
    return res.status(400).json({
      success: false,
      error: 'Wymagane pola: username, password, deviceName',
    });
  }

  try {
    const accountData = {
      ...setupSession.data,
      username,
      password,
      deviceName,
      theme: theme || 'dark',
      wallpaper: null,
      desktopLayout: 'default',
      autoUpdates: true,
      syncSettings: false,
      backups: false,
    };

    await createAccount(accountData);

    setupSession = {};

    res.json({ success: true, redirect: '/' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/languages', (req, res) => {
  res.json({
    success: true,
    languages: [
      {
        code: 'pl',
        label: 'Polski',
        region: 'PL',
        numberFormat: '1 234,56',
        dateFormat: 'DD.MM.YYYY',
      },
      {
        code: 'en',
        label: 'English',
        region: 'US',
        numberFormat: '1,234.56',
        dateFormat: 'MM/DD/YYYY',
      },
      {
        code: 'de',
        label: 'Deutsch',
        region: 'DE',
        numberFormat: '1.234,56',
        dateFormat: 'DD.MM.YYYY',
      },
      {
        code: 'fr',
        label: 'Français',
        region: 'FR',
        numberFormat: '1 234,56',
        dateFormat: 'DD/MM/YYYY',
      },
      {
        code: 'es',
        label: 'Español',
        region: 'ES',
        numberFormat: '1.234,56',
        dateFormat: 'DD/MM/YYYY',
      },
      {
        code: 'it',
        label: 'Italiano',
        region: 'IT',
        numberFormat: '1.234,56',
        dateFormat: 'DD/MM/YYYY',
      },
      {
        code: 'pt',
        label: 'Português',
        region: 'BR',
        numberFormat: '1.234,56',
        dateFormat: 'DD/MM/YYYY',
      },
      {
        code: 'ru',
        label: 'Русский',
        region: 'RU',
        numberFormat: '1 234,56',
        dateFormat: 'DD.MM.YYYY',
      },
      {
        code: 'uk',
        label: 'Українська',
        region: 'UA',
        numberFormat: '1 234,56',
        dateFormat: 'DD.MM.YYYY',
      },
      {
        code: 'zh',
        label: '中文',
        region: 'CN',
        numberFormat: '1,234.56',
        dateFormat: 'YYYY/MM/DD',
      },
      {
        code: 'ja',
        label: '日本語',
        region: 'JP',
        numberFormat: '1,234.56',
        dateFormat: 'YYYY/MM/DD',
      },
      {
        code: 'ko',
        label: '한국어',
        region: 'KR',
        numberFormat: '1,234.56',
        dateFormat: 'YYYY.MM.DD',
      },
      {
        code: 'ar',
        label: 'العربية',
        region: 'SA',
        numberFormat: '١٬٢٣٤٫٥٦',
        dateFormat: 'DD/MM/YYYY',
      },
      {
        code: 'he',
        label: 'עברית',
        region: 'IL',
        numberFormat: '1,234.56',
        dateFormat: 'DD/MM/YYYY',
      },
      {
        code: 'hi',
        label: 'हिन्दी',
        region: 'IN',
        numberFormat: '1,23,456',
        dateFormat: 'DD/MM/YYYY',
      },
    ],
  });
});

router.get('/keyboard-layouts', (req, res) => {
  res.json({
    success: true,
    layouts: [
      { code: 'pl', label: 'Polski (QWERTY)' },
      { code: 'pl214', label: 'Polski (Programisty)' },
      { code: 'us', label: 'English (US)' },
      { code: 'uk', label: 'English (UK)' },
      { code: 'de', label: 'Deutsch (QWERTZ)' },
      { code: 'fr', label: 'Français (AZERTY)' },
      { code: 'es', label: 'Español' },
      { code: 'it', label: 'Italiano' },
      { code: 'ru', label: 'Русский' },
      { code: 'ua', label: 'Українська' },
      { code: 'jp', label: '日本語' },
    ],
  });
});

router.get('/timezones', (req, res) => {
  res.json({
    success: true,
    timezones: [
      'Europe/Warsaw',
      'Europe/London',
      'Europe/Berlin',
      'Europe/Paris',
      'Europe/Madrid',
      'Europe/Rome',
      'Europe/Kyiv',
      'Europe/Moscow',
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'America/Sao_Paulo',
      'Asia/Tokyo',
      'Asia/Seoul',
      'Asia/Shanghai',
      'Asia/Kolkata',
      'Asia/Dubai',
      'Africa/Cairo',
      'Australia/Sydney',
      'Pacific/Auckland',
      'UTC',
    ],
  });
});

module.exports = router;
