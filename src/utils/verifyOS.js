const os = require('os');
const { execSync } = require('child_process');

function detectOS() {
  const platform = process.platform;

  switch (platform) {
    case 'win32':
      return 'Windows';
    case 'darwin':
      return 'macOS';
    case 'linux':
      return 'Linux';
    default:
      return 'Unknown';
  }
}

function getKernelVersion() {
  try {
    return os.release();
  } catch {
    return 'unknown';
  }
}

function getCPU() {
  try {
    const cpus = os.cpus();
    return {
      model: cpus?.[0]?.model || 'unknown',
      cores: cpus?.length || 0,
    };
  } catch {
    return { model: 'unknown', cores: 0 };
  }
}

function detectGraphicsEngine() {
  const platform = process.platform;

  try {
    if (platform === 'darwin') {
      const gpu = execSync('system_profiler SPDisplaysDataType')
        .toString();

      if (gpu.includes('Metal')) return 'Apple Metal';
      return 'Apple Graphics (CoreGraphics/Metal)';
    }

    if (platform === 'win32') {
      const gpu = execSync('wmic path win32_VideoController get name')
        .toString();

      if (gpu.toLowerCase().includes('nvidia')) return 'NVIDIA (DirectX / WDDM)';
      if (gpu.toLowerCase().includes('amd')) return 'AMD (DirectX / WDDM)';
      if (gpu.toLowerCase().includes('intel')) return 'Intel Integrated Graphics (DirectX / WDDM)';

      return 'Windows Graphics (DirectX / WDDM)';
    }

    if (platform === 'linux') {
      try {
        const gl = execSync('glxinfo -B').toString();

        if (gl.toLowerCase().includes('vulkan')) return 'Vulkan / OpenGL';
        return 'OpenGL';
      } catch {
        return 'OpenGL (unknown driver)';
      }
    }

    return 'Unknown Graphics Engine';
  } catch {
    return 'Graphics detection failed';
  }
}

function verifyOS() {
  return {
    os: detectOS(),
    platform: process.platform,
    kernel: getKernelVersion(),
    cpu: getCPU(),
    graphicsEngine: detectGraphicsEngine(),
  };
}

module.exports = {
  detectOS,
  detectGraphicsEngine,
  verifyOS,
};
