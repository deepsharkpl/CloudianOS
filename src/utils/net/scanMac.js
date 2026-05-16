const { exec } = require('child_process');
const parseAirport = require('./utils/parseAirport');
const parseSystemProfiler = require('./utils/parseSystemProfiler');

function scanMac() {
  return new Promise((resolve, reject) => {
    exec(
      '/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -s',
      (err, stdout) => {
        if (err) {
          exec('system_profiler SPAirPortDataType', (err2, stdout2) => {
            if (err2) {
              return reject(err2);
            }

            resolve(parseSystemProfiler(stdout2));
          });

          return;
        }

        resolve(parseAirport(stdout));
      },
    );
  });
}

module.exports = scanMac;
