const https = require('https');
const config = require('../../config')

const REQUIRED_NODE_VERSION = '25.0.0';
const REQUIRED_NPM_VERSION = '11.0.0';
const CLOUDIANOS_PACKAGE_URL =
  'https://raw.githubusercontent.com/deepsharkpl/CloudianOS/main/package.json';

function compareVersions(v1, v2) {
  const a = v1.replace(/^v/, '').split('.').map(Number);
  const b = v2.replace(/^v/, '').split('.').map(Number);

  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const num1 = a[i] || 0;
    const num2 = b[i] || 0;

    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

function checkNodeVersion() {
  const nodeVersion = config.nodeVersion;
  return compareVersions(nodeVersion, REQUIRED_NODE_VERSION) >= 0;
}

function checkNpmVersion() {
  const npmVersion = config.npmVersion;

  if (!npmVersion) return false;

  return compareVersions(npmVersion, REQUIRED_NPM_VERSION) >= 0;
}

function fetchCloudianOSVersion() {
  return new Promise((resolve, reject) => {
    https.get(CLOUDIANOS_PACKAGE_URL, (res) => {
      let data = '';

      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.version);
        } catch (err) {
          reject('Failed to parse CloudianOS package.json');
        }
      });
    }).on('error', (err) => reject(err.message));
  });
}

async function verifyAllVersions() {
  const nodeOk = checkNodeVersion();
  const npmOk = checkNpmVersion();

  let cloudianVersion = null;
  let cloudianOk = false;

  try {
    cloudianVersion = await fetchCloudianOSVersion();
    cloudianOk = compareVersions(cloudianVersion, '0.0.0') >= 0;
  } catch (err) {
    console.error('CloudianOS error:', err);
  }

  return {
    node: {
      current: process.versions.node,
      required: REQUIRED_NODE_VERSION,
      ok: nodeOk,
    },
    npm: {
      current: 'unknown (from environment)',
      required: REQUIRED_NPM_VERSION,
      ok: npmOk,
    },
    cloudianOS: {
      current: cloudianVersion,
      ok: cloudianOk,
    },
  };
}

function blockIfInvalidVersions() {
  return verifyAllVersions().then((result) => {
    const issues = [];

    if (!result.node.ok) {
      issues.push(
        `Node.js version too old: required >= ${REQUIRED_NODE_VERSION}, you have ${result.node.current}`
      );
    }

    if (!result.npm.ok) {
      issues.push(
        `npm version too old: required >= ${REQUIRED_NPM_VERSION}`
      );
    }

    if (issues.length > 0) {
      console.error('\nSystem requirements not met:\n');
      issues.forEach((i) => console.error('- ' + i));
      console.error('\nApplication will be stopped.\n');
      process.exit(1);
    }

    return result;
  });
}

module.exports = {
  checkNodeVersion,
  checkNpmVersion,
  fetchCloudianOSVersion,
  verifyAllVersions,
  blockIfInvalidVersions,
};
