const { spawn } = require('child_process');

function linuxScan(timeoutMs) {
  return new Promise((resolve) => {
    const devices = new Map();
    const proc = spawn('bluetoothctl', [], { stdio: ['pipe', 'pipe', 'pipe'] });

    proc.stdout.on('data', (data) => {
      for (const line of data.toString().split('\n')) {
        const m = line.match(/\[NEW\]\s+Device\s+([\w:]+)\s+(.*)/);
        if (m) {
          const [, addr, name] = m;
          if (!devices.has(addr))
            devices.set(addr, {
              address: addr,
              name: name.trim() || null,
              rssi: null,
            });
        }
        const r = line.match(/([\w:]{17}).*RSSI[:\s]+([-\d]+)/);
        if (r && devices.has(r[1])) devices.get(r[1]).rssi = parseInt(r[2]);
      }
    });

    proc.stdin.write('scan on\n');

    setTimeout(() => {
      proc.stdin.write('scan off\nquit\n');
      setTimeout(() => {
        proc.kill();
        resolve([...devices.values()]);
      }, 1_500);
    }, timeoutMs);

    proc.on('error', () => resolve([...devices.values()]));
  });
}

module.exports = linuxScan;
