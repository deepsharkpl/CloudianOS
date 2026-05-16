const scanWifi = require('../utils/net/scanWifi');
const { getCurrentDate } = require('../utils/system/getCurrentDate');
const { getTime24 } = require('../utils/system/getTime');

const os = require('os');
const PLATFORM = os.platform();

const SCAN_TIMEOUT_MS = 12_000;

const express = require('express');
const checkBluetooth = require('../utils/bluetooth/utils/checkBluetooth');
const scanBluetooth = require('../utils/bluetooth/utils/scanBluetooth');
const router = express.Router();

router.get('/time', (req, res) => {
  res.json({
    time: getTime24(),
    date: getCurrentDate(),
  });
});

router.get('/wifi', async (req, res) => {
  try {
    const networks = await scanWifi();

    res.json({
      success: true,
      platform: os.platform(),
      count: networks.length,
      networks,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

router.get('/bluetooth/check', async (req, res) => {
  try {
    const result = await checkBluetooth();
    return res.json({ platform: PLATFORM, ...result });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/bluetooth/scan', async (req, res) => {
  const timeoutMs = Math.min(
    Math.max(parseInt(req.query.timeout) || SCAN_TIMEOUT_MS, 2_000),
    60_000,
  );

  let check;
  try {
    check = await checkBluetooth();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

  if (!check.available || !check.powered) {
    return res.json({
      platform: PLATFORM,
      ...check,
      devices: [],
      message: 'Bluetooth niedostępny lub wyłączony.',
    });
  }

  res.setTimeout(timeoutMs + 10_000);

  try {
    const devices = await scanBluetooth(timeoutMs);
    return res.json({
      platform: PLATFORM,
      available: true,
      state: 'poweredOn',
      scanDurationMs: timeoutMs,
      devicesFound: devices.length,
      devices,
    });
  } catch (err) {
    return res.status(500).json({
      platform: PLATFORM,
      available: true,
      state: 'poweredOn',
      error: err.message,
      devices: [],
    });
  }
});

module.exports = router;
