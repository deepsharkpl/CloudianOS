const os = require('os');
const path = require('path');

function expandHome(p) {
  if (!p) return p;
  if (p.startsWith('~')) {
    return path.join(os.homedir(), p.slice(1));
  }
  return p;
}

module.exports = {
  expandHome,
};