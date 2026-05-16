const os = require('os');
const macScan = require('../platforms/macos/macScan');
const linuxScan = require('../platforms/linux/linuxScan');
const winScan = require('../platforms/windows/winScan');

const PLATFORM = os.platform();

async function scanBluetooth(timeoutMs) {
  switch (PLATFORM) {
    case 'darwin':
      return macScan(timeoutMs);
    case 'linux':
      return linuxScan(timeoutMs);
    case 'win32':
      return winScan(timeoutMs);
    default:
      return [];
  }
}

module.exports = scanBluetooth;
