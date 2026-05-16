const { exec } = require('child_process');

function scanLinux() {
  return new Promise((resolve, reject) => {
    exec(`nmcli -t -f SSID,SIGNAL,CHAN,SECURITY dev wifi`, (err, stdout) => {
      if (err) return reject(err);

      const networks = stdout
        .split('\n')
        .filter(Boolean)
        .map((line) => {
          const parts = line.split(':');

          return {
            ssid: parts[0] || '',
            signal: Number(parts[1]) || 0,
            channel: parts[2] || '',
            security: parts[3] || '',
          };
        });

      resolve(networks);
    });
  });
}

module.exports = scanLinux;
