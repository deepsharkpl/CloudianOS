function createProgressCallback(fn) {
  return (progress) => {
    if (typeof fn === 'function') {
      fn(progress);
    }
  };
}

module.exports = {
  createProgressCallback,
};