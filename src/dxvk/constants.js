const path = require('path');
const os = require('os');

const DXVK_DLLS_X64 = ['d3d9.dll', 'd3d10core.dll', 'd3d11.dll', 'dxgi.dll'];

const DXVK_DLLS_X32 = ['d3d9.dll', 'd3d10core.dll', 'd3d11.dll', 'dxgi.dll'];

const GITHUB_API =
  'https://api.github.com/repos/doitsujin/dxvk/releases/latest';

const DXVK_CACHE_DIR = path.join(os.homedir(), '.blueberry-dxvk', 'dxvk-cache');

module.exports = {
  DXVK_DLLS_X64,
  DXVK_DLLS_X32,
  GITHUB_API,
  DXVK_CACHE_DIR,
};
