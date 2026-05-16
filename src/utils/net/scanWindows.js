const { exec } = require('child_process');

function scanWindows() {
  return new Promise((resolve, reject) => {
    exec(
      `netsh wlan show networks mode=bssid`,
      { encoding: 'utf8' },
      (err, stdout) => {
        if (err) return reject(err);

        const lines = stdout.split('\n');

        const networks = [];
        let current = null;

        for (const rawLine of lines) {
          const line = rawLine.trim();

          if (line.startsWith('SSID ')) {
            if (current) networks.push(current);

            current = {
              ssid: line.split(':')[1]?.trim(),
            };
          }

          if (line.startsWith('Signal') && current) {
            current.signal = line.split(':')[1]?.trim();
          }

          if (line.startsWith('Authentication') && current) {
            current.security = line.split(':')[1]?.trim();
          }

          if (line.startsWith('Channel') && current) {
            current.channel = line.split(':')[1]?.trim();
          }
        }

        if (current) networks.push(current);

        resolve(networks);
      },
    );
  });
}

module.exports = scanWindows;
