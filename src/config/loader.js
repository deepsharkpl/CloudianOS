const { getEnv, getEnvNumber } = require('./env');

const { expandHome } = require('./expand-home');

let config = null;

function loadConfig() {
  const defaultPrefixPath = expandHome(
    getEnv('DEFAULT_PREFIX_PATH', '~/.blueberry/prefixes'),
  );

  return {
    port: getEnvNumber('HTTP_PORT', 3000),
    wine: {
      binary: getEnv('WINE_BINARY', 'wine'),
      binary64: getEnv('WINE64_BINARY', 'wine64'),
      wineserver: getEnv('WINESERVER_BINARY', 'wineserver'),
      defaultPrefixPath,
      debug: getEnv('WINE_DEBUG', '-all'),
    },

    logging: {
      level: getEnv('LOG_LEVEL', 'info'),
      dir: expandHome(getEnv('LOG_DIR', './wine/logs')),
      maxFiles: getEnvNumber('LOG_MAX_FILES', 10),
      maxSize: getEnv('LOG_MAX_SIZE', '10m'),
    },

    process: {
      checkInterval: getEnvNumber('PROCESS_CHECK_INTERVAL', 5000),
      zombieCleanupInterval: getEnvNumber('ZOMBIE_CLEANUP_INTERVAL', 30000),
      maxProcesses: getEnvNumber('MAX_PROCESSES', 50),
    },

    display: {
      mode: getEnv('DISPLAY_MODE', 'browser'),
      width: getEnvNumber('DISPLAY_WIDTH', 1280),
      height: getEnvNumber('DISPLAY_HEIGHT', 720),
      depth: getEnvNumber('DISPLAY_DEPTH', 24),
      displayStart: getEnvNumber('DISPLAY_START', 90),
      vncPortStart: getEnvNumber('VNC_PORT_START', 5900),
      xvfbBinary: getEnv('XVFB_BINARY', 'Xvfb'),
      x11vncBinary: getEnv('X11VNC_BINARY', 'x11vnc'),
    },
  };
}

function getConfig() {
  if (!config) {
    config = loadConfig();
  }
  return config;
}

function resetConfig() {
  config = null;
}

module.exports = {
  loadConfig,
  getConfig,
  resetConfig,
};
