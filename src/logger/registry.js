const { createLogger } = require('./winston-factory');

const loggers = new Map();

function getLogger(service = 'core') {
  if (!loggers.has(service)) {
    loggers.set(service, createLogger(service));
  }
  return loggers.get(service);
}

module.exports = {
  getLogger,
  loggers,
};
