const { fetchJson } = require('../utils/net/fetch-json');
const { GITHUB_API } = require('./constants');

async function getLatestRelease() {
  const release = await fetchJson(GITHUB_API);

  const version = release.tag_name.replace(/^v/, '');

  const tarAsset = release.assets.find(
    (a) => a.name.endsWith('.tar.gz') && !a.name.includes('async'),
  );

  if (!tarAsset) {
    throw new Error('No DXVK tar.gz asset found in latest release');
  }

  return {
    version,
    tarUrl: tarAsset.browser_download_url,
  };
}

module.exports = {
  getLatestRelease,
};
