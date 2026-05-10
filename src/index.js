const { blockIfInvalidVersions } = require('./utils/verifyVersion');

async function startApp() {
  try {
    await blockIfInvalidVersions();
    console.log('All system requirements met.');
  } catch (err) {
    console.error('Failed to start application:', err);
    process.exit(1);
  }
}

startApp();