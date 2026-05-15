const { WINE_SEARCH_PATHS_DARWIN } = require('./darwin');
const { WINE_SEARCH_PATHS_LINUX } = require('./linux');
const { WINE_SEARCH_PATHS_WIN32 } = require('./windows');

module.exports = {
  WINE_SEARCH_PATHS_DARWIN,
  WINE_SEARCH_PATHS_LINUX,
  WINE_SEARCH_PATHS_WIN32,
};
