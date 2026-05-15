function getEnv(key, fallback) {
  return process.env[key] ?? fallback;
}

function getEnvNumber(key, fallback) {
  const val = process.env[key];
  if (val === undefined) return fallback;

  const num = parseInt(val, 10);
  return isNaN(num) ? fallback : num;
}

module.exports = {
  getEnv,
  getEnvNumber,
};
