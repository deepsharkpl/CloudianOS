const fs = require('fs');
const path = require('path');

function createProcessLogger(processId, logDir) {
  const entries = [];
  const maxEntries = 1000;

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const file = path.join(logDir, `process-${processId}.log`);
  const stream = fs.createWriteStream(file, { flags: 'a' });

  function log(level, source, message) {
    const entry = {
      timestamp: new Date(),
      level,
      source,
      message: message.trim(),
    };

    entries.push(entry);

    if (entries.length > maxEntries) {
      entries.splice(0, entries.length - maxEntries);
    }

    const line =
      `[${entry.timestamp.toISOString()}] ` +
      `[${entry.level}] ` +
      `[${entry.source}] ` +
      `${entry.message}\n`;

    stream.write(line);
  }

  return {
    log,

    stdout(msg) {
      log('info', 'stdout', msg);
    },

    stderr(msg) {
      log('warn', 'stderr', msg);
    },

    system(level, msg) {
      log(level, 'system', msg);
    },

    getLogs(limit = 100, offset = 0) {
      return entries.slice(offset, offset + limit);
    },

    getAllLogs() {
      return [...entries];
    },

    close() {
      stream.end();
    },
  };
}

module.exports = {
  createProcessLogger,
};
