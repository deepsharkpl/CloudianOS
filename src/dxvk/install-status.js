const DxvkInstallStatus = {
  IDLE: 'idle',
  FETCHING_RELEASE: 'fetching_release',
  DOWNLOADING: 'downloading',
  EXTRACTING: 'extracting',
  INSTALLING: 'installing',
  DONE: 'done',
  ERROR: 'error',
};

function createDxvkInstallProgress(data = {}) {
  return {
    status: data.status || DxvkInstallStatus.IDLE,
    message: data.message || '',
    percent: data.percent || 0,
    version: data.version,
    error: data.error,
  };
}

module.exports = {
  DxvkInstallStatus,
  createDxvkInstallProgress,
};