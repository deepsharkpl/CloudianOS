function createReporter(prefix, log, onProgress, activeInstalls) {
  return (status, message, percent, extra = {}) => {
    activeInstalls.set(prefix.id, status);

    log.info(`[DXVK:${prefix.name}] ${message} (${percent}%)`);

    onProgress({
      status,
      message,
      percent,
      ...extra,
    });
  };
}

module.exports = {
  createReporter,
};
