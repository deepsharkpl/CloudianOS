const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function isExecutable(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

function commandExists(command) {
  if (!command) return false;

  if (path.isAbsolute(command) || command.includes(path.sep)) {
    return isExecutable(command);
  }

  try {
    execSync(`command -v "${command.replace(/"/g, '\\"')}" >/dev/null 2>&1`, {
      stdio: 'ignore',
    });
    return true;
  } catch {
    return false;
  }
}

function resolveCommand(command) {
  if (!command) return null;

  if (
    (path.isAbsolute(command) || command.includes(path.sep)) &&
    isExecutable(command)
  ) {
    return command;
  }

  try {
    const resolved = execSync(
      `command -v "${command.replace(/"/g, '\\"')}" 2>/dev/null`,
      { encoding: 'utf-8' },
    ).trim();

    return resolved || null;
  } catch {
    return null;
  }
}

module.exports = {
  commandExists,
  resolveCommand,
};
