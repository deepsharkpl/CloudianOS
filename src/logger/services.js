const { getLogger } = require('./registry');

const coreLogger = () => getLogger('core');
const apiLogger = () => getLogger('api');
const launcherLogger = () => getLogger('launcher');
const prefixLogger = () => getLogger('prefix');
const processLogger = () => getLogger('process');
const platformLogger = () => getLogger('platform');

module.exports = {
  coreLogger,
  apiLogger,
  launcherLogger,
  prefixLogger,
  processLogger,
  platformLogger,
};
