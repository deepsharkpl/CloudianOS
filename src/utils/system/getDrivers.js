const { exec } = require('child_process');
const os = require('os');

function run(command) {
  return new Promise((resolve, reject) => {
    exec(command, { maxBuffer: 1024 * 1024 * 50 }, (err, stdout, stderr) => {
      if (err) {
        return reject(stderr || err.message);
      }

      resolve(stdout.trim());
    });
  });
}

async function getDrivers() {
  const platform = os.platform();

  try {
    switch (platform) {
      case 'win32':
        return await getWindowsDrivers();

      case 'linux':
        return await getLinuxDrivers();

      case 'darwin':
        return await getMacDrivers();

      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  } catch (e) {
    return {
      success: false,
      error: e.toString(),
      platform,
    };
  }
}

async function getWindowsDrivers() {
  const output = await run(`driverquery /FO CSV /V`);

  const lines = output.split('\n').slice(1);

  const drivers = lines.map((line) => {
    const cols = parseCSV(line);

    return {
      moduleName: cols[0] || null,
      displayName: cols[1] || null,
      description: cols[2] || null,
      driverType: cols[3] || null,
      startMode: cols[4] || null,
      state: cols[5] || null,
      status: cols[6] || null,
      path: cols[7] || null,
    };
  });

  return {
    success: true,
    platform: 'windows',
    count: drivers.length,
    drivers,
  };
}

async function getLinuxDrivers() {
  const output = await run('lsmod');

  const lines = output.split('\n').slice(1);

  const drivers = lines.map((line) => {
    const parts = line.trim().split(/\s+/);

    return {
      moduleName: parts[0] || null,
      size: parts[1] || null,
      usedByCount: parts[2] || null,
      usedBy: parts.slice(3).join(' ') || null,
    };
  });

  return {
    success: true,
    platform: 'linux',
    count: drivers.length,
    drivers,
  };
}

async function getMacDrivers() {
  const output = await run('kextstat');

  const lines = output.split('\n').slice(1);

  const drivers = [];

  for (const line of lines) {
    const parts = line.trim().split(/\s+/);

    if (parts.length < 6) continue;

    drivers.push({
      index: parts[0],
      refs: parts[1],
      address: parts[2],
      size: parts[3],
      wired: parts[4],
      name: parts.slice(5).join(' '),
    });
  }

  return {
    success: true,
    platform: 'macos',
    count: drivers.length,
    drivers,
  };
}

function parseCSV(line) {
  const result = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === ',' && !insideQuotes) {
      result.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  result.push(current);

  return result;
}

module.exports = {
  getDrivers,
};
