const os = require('os');
const macCheckBluetooth = require('../platforms/macos/macCheckBluetooth');
const linuxCheckBluetooth = require('../platforms/linux/linuxCheckBluetooth');
const winCheckBluetooth = require('../platforms/windows/winCheckBluetooth');

const PLATFORM = os.platform();

async function checkBluetooth() {
  switch (PLATFORM) {
    case 'darwin':
      return macCheckBluetooth();
    case 'linux':
      return linuxCheckBluetooth();
    case 'win32':
      return winCheckBluetooth();
    default:
      return {
        available: false,
        state: 'unsupported_platform',
        platform: PLATFORM,
      };
  }
}

module.exports = checkBluetooth;
