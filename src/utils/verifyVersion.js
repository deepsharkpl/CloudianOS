const https = require('https');
const config = require('../../config');

const REQUIRED_NODE_VERSION = '25.0.0';
const REQUIRED_NPM_VERSION = '11.0.0';
const BLUEBERRY_PACKAGE_URL =
  'https://raw.githubusercontent.com/deepsharkpl/Blueberry/main/package.json';

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

function fetchBlueberryVersion() {
  return new Promise((resolve, reject) => {
    https
      .get(BLUEBERRY_PACKAGE_URL, (res) => {
        let data = '';

        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve(json.version);
          } catch {
            reject('[ FAIL ] Failed to parse Blueberry package.json');
          }
        });
      })
      .on('error', (err) => reject(err.message));
  });
}

async function verifyAllVersions() {
  const nodeOk = checkNodeVersion();
  const npmOk = checkNpmVersion();

  let blueberryVersion = null;
  let blueberryOk = false;

  try {
    blueberryVersion = await fetchBlueberryVersion();
    blueberryOk = compareVersions(blueberryVersion, '0.0.0') >= 0;
  } catch (err) {
    console.error('[ FAIL ] Blueberry error:', err);
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
    blueberry: {
      current: blueberryVersion,
      ok: blueberryOk,
    },
  };
}

function blockIfInvalidVersions() {
  return verifyAllVersions().then((result) => {
    const issues = [];

    if (!result.node.ok) {
      issues.push(
        `Node.js version too old: required >= ${REQUIRED_NODE_VERSION}, you have ${result.node.current}`,
      );
    }

    if (!result.npm.ok) {
      issues.push(`npm version too old: required >= ${REQUIRED_NPM_VERSION}`);
    }

    if (issues.length > 0) {
      console.error('\n[ FAIL ] System requirements not met:\n');
      issues.forEach((i) => console.error('- ' + i));
      console.error('\n[ FAIL ] Application will be stopped.\n');
      process.exit(1);
    }

    return result;
  });
}

module.exports = {
  checkNodeVersion,
  checkNpmVersion,
  fetchBlueberryVersion,
  verifyAllVersions,
  blockIfInvalidVersions,
};
