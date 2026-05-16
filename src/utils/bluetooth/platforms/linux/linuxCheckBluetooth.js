const run = require('../../utils/run');

async function linuxCheckBluetooth() {
  try {
    const out = await run('hciconfig 2>&1');
    if (!out || out.includes('No such file or directory')) {
      return {
        available: false,
        state: 'hciconfig_not_found',
        hint: 'sudo apt install bluetooth bluez',
      };
    }
    const powered = /UP RUNNING|PSCAN|ISCAN/.test(out);
    const addrMatch = out.match(/BD Address:\s*([\w:]+)/i);
    return {
      available: true,
      powered,
      state: powered ? 'poweredOn' : 'poweredOff',
      address: addrMatch?.[1] ?? null,
    };
  } catch {
    return {
      available: false,
      state: 'no_adapter',
      hint: 'sudo apt install bluetooth bluez',
    };
  }
}

module.exports = linuxCheckBluetooth;
