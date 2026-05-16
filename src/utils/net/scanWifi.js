const os = require('os');
const scanLinux = require('./scanLinux');
const scanWindows = require('./scanWindows');
const scanMac = require('./scanMac');

async function scanWifi() {
  const platform = os.platform();

  switch (platform) {
    case 'linux':
      return await scanLinux();

    case 'win32':
      return await scanWindows();

    case 'darwin':
      return await scanMac();

    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

module.exports = scanWifi;
