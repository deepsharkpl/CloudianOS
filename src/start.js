const readline = require('readline');
const chalk = require('chalk');
const config = require('../config');

const clear = require('./utils/system/clear');
const color = require('./utils/text/color');
const centerText = require('./utils/text/centerText');
const centerBoxText = require('./utils/text/centerBoxText');
const boxText = require('./utils/text/boxText');
const { detectOS } = require('./utils/verifyOS');

const availableOS = detectOS();

async function verifySystem() {
  if (availableOS === 'Unsupported') {
    console.error(
      '[ ' +
        chalk.red('FAIL') +
        ' ] ' +
        `Unsupported platform: ${process.platform}. Requires macOS, Linux, or Windows.`,
    );
    process.exit(0);
  } else {
    startGRUB();
  }
}

async function startBoot() {
  clear();
  require('./index');
}

async function startCLI() {
  clear();
  console.log(color('Starting Blueberry CLI...', 'yellow'));
}

async function memoryTest() {
  clear();
  console.log(color('Running Memory Test...', 'yellow'));
}

function shutdown() {
  clear();
  console.log(
    '[ ' + chalk.green('OK') + ' ] ' + color('System halted.', 'white'),
  );
  console.log('');
  process.exit(0);
}

const menuItems = [
  {
    label: 'Blueberry (default)',
    action: startBoot,
  },
  {
    label: 'Blueberry - CLI',
    action: startCLI,
  },
  {
    label: 'MemoryTest',
    action: memoryTest,
  },
  {
    label: 'Shutdown',
    action: shutdown,
  },
];

let selected = 0;
let countdown = 30;
let countdownTimer = null;

function renderMenu() {
  clear();

  const line =
    '╔═════════════════════════════════════════════════════════════════╗';

  const separator =
    '║─────────────────────────────────────────────────────────────────║';

  const line_bottom =
    '╚═════════════════════════════════════════════════════════════════╝';

  const width = line.length;

  console.log(color(centerText('GNU GRUB  version 2.14', width), 'white'));

  console.log(line);

  console.log(
    centerBoxText(color(' Blueberry Unified Boot Manager', 'gray'), width),
  );
  console.log(
    centerBoxText(
      color(' Software version: ', 'gray') + color(config.version, 'green'),
      width,
    ),
  );

  console.log(separator);

  menuItems.forEach((item, index) => {
    const isSelected = index === selected;

    const bullet = isSelected ? color('•', 'yellow') : color('•', 'gray');

    const text = isSelected
      ? color(item.label, 'yellow')
      : color(item.label, 'gray');

    console.log(boxText(` ${bullet} ${text}`, 87));
  });

  console.log(separator);

  console.log(
    centerBoxText(
      color(
        'Use the ↑ and ↓ keys to select which entry is highlighted.',
        'gray',
      ),
      width,
    ),
  );
  console.log(
    centerBoxText(
      color(
        "Press enter to boot the selected OS. 'e' to edit the commands",
        'gray',
      ),
      width,
    ),
  );
  console.log(
    centerBoxText(
      color("before booting or 'c' for a command-line.", 'gray'),
      width,
    ),
  );
  console.log(centerBoxText('', width));
  console.log(
    centerBoxText(
      color(
        `The highlighted entry will be started automatically in ${countdown}s.`,
        'cyan',
      ),
      width,
    ),
  );

  console.log(line_bottom);
}

function startCountdown() {
  countdownTimer = setInterval(async () => {
    countdown--;
    renderMenu();

    if (countdown <= 0) {
      clearInterval(countdownTimer);
      countdownTimer = null;
      process.stdin.setRawMode(false);
      process.stdin.pause();
      await menuItems[selected].action();
    }
  }, 1000);
}

function startGRUB() {
  readline.emitKeypressEvents(process.stdin);

  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }

  renderMenu();
  startCountdown();

  process.stdin.on('keypress', async (_, key) => {
    if (!key) return;

    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdown = 30;
      startCountdown();
    }

    if (key.name === 'up') {
      selected--;

      if (selected < 0) {
        selected = menuItems.length - 1;
      }

      renderMenu();
    }

    if (key.name === 'down') {
      selected++;

      if (selected >= menuItems.length) {
        selected = 0;
      }

      renderMenu();
    }

    if (key.name === 'return') {
      clearInterval(countdownTimer);
      countdownTimer = null;
      process.stdin.setRawMode(false);
      process.stdin.pause();

      await menuItems[selected].action();
    }

    if (key.ctrl && key.name === 'c') {
      clearInterval(countdownTimer);
      process.exit();
    }
  });
}

verifySystem();
