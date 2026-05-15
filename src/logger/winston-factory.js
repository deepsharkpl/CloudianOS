const winston = require('winston');
const fs = require('fs');
const path = require('path');
const { getConfig } = require('../config');

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, service, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';

  return `[${timestamp}] [${level
    .toUpperCase()
    .padEnd(5)}] [${service ?? 'core'}] ${message}${metaStr}`;
});

const consoleFormat = printf(
  ({ level, message, timestamp, service, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';

    return `[${timestamp}] [${service ?? 'core'}] ${message}${metaStr}`;
  },
);

function createLogger(service) {
  const config = getConfig();
  const logDir = config.logging.dir;

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const transports = [
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: 'HH:mm:ss' }),
        consoleFormat,
      ),
    }),

    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxFiles: config.logging.maxFiles,
      format: combine(timestamp(), errors({ stack: true }), logFormat),
    }),

    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxFiles: config.logging.maxFiles,
      format: combine(timestamp(), errors({ stack: true }), logFormat),
    }),
  ];

  return winston.createLogger({
    level: config.logging.level,
    defaultMeta: { service },
    transports,
    exitOnError: false,
  });
}

module.exports = {
  createLogger,
};
