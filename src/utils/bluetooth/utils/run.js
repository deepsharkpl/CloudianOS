const { exec } = require('child_process');

function run(cmd, opts = {}) {
  return new Promise((resolve, reject) => {
    exec(cmd, { timeout: 15_000, ...opts }, (err, stdout, stderr) => {
      if (err) reject(Object.assign(err, { stderr }));
      else resolve(stdout.trim());
    });
  });
}

module.exports = run;
