const fs = require('fs');
const util = require('util');
const { execFile } = require('child_process');
const { detectOS } = require('../verifyOS');

const execFileAsync = util.promisify(execFile);

const os = detectOS();

const { WINE_SEARCH_PATHS_DARWIN } = require('../platforms/darwin');

const { WINE_SEARCH_PATHS_LINUX } = require('../platforms/linux');

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

  const existingPaths = paths.filter((path) => fs.existsSync(path));

  return {
    installed: existingPaths.length > 0,
    paths: existingPaths,
    path: existingPaths[0] || null,
  };
}

async function getWineVersions() {
  const wine = detectWine();

  if (!wine.installed) {
    return [];
  }

  const versions = await Promise.all(
    wine.paths.map(async (path) => {
      try {
        const { stdout } = await execFileAsync(path, ['--version']);

        return {
          path,
          version: stdout.trim(),
        };
      } catch (error) {
        return {
          path,
          version: 'unknown',
          error: error.message,
        };
      }
    }),
  );

  return versions;
}

module.exports = {
  detectWine,
  getWineVersions,
};
