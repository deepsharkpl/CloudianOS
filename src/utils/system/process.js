const util = require('util');
const { exec } = require('child_process');
const { detectOS } = require('../verifyOS');

const execAsync = util.promisify(exec);

const os = detectOS();

function isPidRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function getChildPids(pid) {
  try {
    if (os === 'macOS') {
      const { stdout } = await execAsync(`pgrep -P ${pid} 2>/dev/null`);

      return stdout
        .trim()
        .split('\n')
        .map(Number)
        .filter((n) => !isNaN(n) && n > 0);
    }

    const { stdout } = await execAsync(
      `cat /proc/${pid}/task/${pid}/children 2>/dev/null || pgrep -P ${pid} 2>/dev/null`,
    );

    return stdout
      .trim()
      .split(/\s+/)
      .map(Number)
      .filter((n) => !isNaN(n) && n > 0);
  } catch {
    return [];
  }
}

async function getWineProcessPids() {
  try {
    const { stdout } = await execAsync('pgrep -f wine 2>/dev/null');

    return stdout
      .trim()
      .split('\n')
      .map(Number)
      .filter((n) => !isNaN(n) && n > 0);
  } catch {
    return [];
  }
}

module.exports = {
  isPidRunning,
  getChildPids,
  getWineProcessPids,
};
