const { blockIfInvalidVersions } = require('./utils/verifyVersion');
const config = require('../config');
const chalk = require('chalk');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function startApp() {
  try {
    await blockIfInvalidVersions();
    console.log('[ ' + chalk.green('OK') + ' ] All system requirements met.');
  } catch (err) {
    console.error(
      '[ ' + chalk.red('FAIL') + ' ] Failed to start application:',
      err,
    );
    process.exit(1);
  }
}

async function boot() {
  console.clear();

  startApp();

  await sleep(700);
  console.log('[ ' + chalk.green('OK') + ' ] System check complete.');

  await sleep(400);
  console.log('\n[ ' + chalk.green('OK') + ' ] Booting Blueberry...\n');

  await sleep(400);
  require('./server');
}

boot();
