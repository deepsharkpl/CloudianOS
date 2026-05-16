const scanWifi = require('../utils/net/scanWifi');
const { getCurrentDate } = require('../utils/system/getCurrentDate');
const { getTime24 } = require('../utils/system/getTime');

const os = require('os');

const express = require('express');
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

module.exports = router;
