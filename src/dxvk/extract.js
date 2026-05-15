const fs = require('fs');
const { execFile } = require('child_process');
const util = require('util');

const execFileAsync = util.promisify(execFile);

async function extractTar(tarPath, destDir) {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  await execFileAsync('tar', [
    '-xzf',
    tarPath,
    '-C',
    destDir,
    '--strip-components=1',
  ]);
}

module.exports = {
  extractTar,
};
