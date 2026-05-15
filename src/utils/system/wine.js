const fs = require('fs');
const { detectOS } = require('../verifyOS');

const os = detectOS()

const {
  WINE_SEARCH_PATHS_DARWIN,
} = require('../platforms/darwin');

const {
  WINE_SEARCH_PATHS_LINUX,
} = require('../platforms/linux');

function getWinePaths() {
  if (os === 'macOS') {
    return WINE_SEARCH_PATHS_DARWIN;
  }

  if (os === 'Linux') {
    return WINE_SEARCH_PATHS_LINUX;
  }

  return [];
}

function detectWine() {
  const paths = getWinePaths();

  const existingPaths = paths.filter((path) =>
    fs.existsSync(path),
  );

  return {
    installed: existingPaths.length > 0,
    paths: existingPaths,
    path: existingPaths[0] || null,
  };
}

module.exports = {
  detectWine,
};