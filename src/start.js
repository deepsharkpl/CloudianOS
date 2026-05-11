const readline = require("readline");
const chalk = require("chalk");
const stripAnsi = require("strip-ansi").default;
const config = require("../config");

const colors = {
  reset: chalk.reset,
  black: chalk.black,
  red: chalk.red,
  green: chalk.green,
  yellow: chalk.yellow,
  blue: chalk.blue,
  magenta: chalk.magenta,
  cyan: chalk.cyan,
  white: chalk.white,
  gray: chalk.gray,
  grey: chalk.grey,
  blackBright: chalk.blackBright,
  redBright: chalk.redBright,
  greenBright: chalk.greenBright,
  yellowBright: chalk.yellowBright,
  blueBright: chalk.blueBright,
  magentaBright: chalk.magentaBright,
  cyanBright: chalk.cyanBright,
  whiteBright: chalk.whiteBright,
  bgBlack: chalk.bgBlack,
  bgRed: chalk.bgRed,
  bgGreen: chalk.bgGreen,
  bgYellow: chalk.bgYellow,
  bgBlue: chalk.bgBlue,
  bgMagenta: chalk.bgMagenta,
  bgCyan: chalk.bgCyan,
  bgWhite: chalk.bgWhite,
  bgBlackBright: chalk.bgBlackBright,
  bgRedBright: chalk.bgRedBright,
  bgGreenBright: chalk.bgGreenBright,
  bgYellowBright: chalk.bgYellowBright,
  bgBlueBright: chalk.bgBlueBright,
  bgMagentaBright: chalk.bgMagentaBright,
  bgCyanBright: chalk.bgCyanBright,
  bgWhiteBright: chalk.bgWhiteBright,
  bold: chalk.bold,
  dim: chalk.dim,
  italic: chalk.italic,
  underline: chalk.underline,
  overline: chalk.overline,
  inverse: chalk.inverse,
  hidden: chalk.hidden,
  strikethrough: chalk.strikethrough,
  visible: chalk.visible,
};

function color(text, clr) {
  return colors[clr] ? colors[clr](text) : text;
}

function clear() {
  process.stdout.write("\x1Bc");
}

function centerText(text, width) {
  const padding = Math.max(0, Math.floor((width - text.length) / 2));

  return " ".repeat(padding) + text;
}

function boxText(text, width) {
  const innerWidth = width - 2;

  return "║" + text + " ".repeat(Math.max(0, innerWidth - text.length)) + "║";
}

function centerBoxText(text, width) {
  const visibleLength = stripAnsi(text).length;

  const innerWidth = width - 2;

  const totalPadding = innerWidth - visibleLength;

  const leftPadding = Math.floor(totalPadding / 2);

  const rightPadding = totalPadding - leftPadding;

  return (
    "║" +
    " ".repeat(Math.max(0, leftPadding)) +
    text +
    " ".repeat(Math.max(0, rightPadding)) +
    "║"
  );
}

async function startBoot() {
  clear();
  require("./index")
}

async function startCLI() {
  clear();
  console.log(color("Starting CloudianOS CLI...", "yellow"));
}

async function memoryTest() {
  clear();
  console.log(color("Running Memory Test...", "yellow"));
}

function shutdown() {
  clear();
  console.log("[ " + chalk.green("OK") + " ] " + color("System halted.", "white"));
  console.log("")
  process.exit(0);
}

const menuItems = [
  {
    label: "CloudianOS Standard",
    action: startBoot,
  },
  {
    label: "CloudianOS CLI",
    action: startCLI,
  },
  {
    label: "MemoryTest",
    action: memoryTest,
  },
  {
    label: "Shutdown",
    action: shutdown,
  },
];

let selected = 0;

function renderMenu() {
  clear();

  const line =
    "╔═════════════════════════════════════════════════════════════════╗";

  const separator =
    "║─────────────────────────────────────────────────────────────────║";

  const line_bottom =
    "╚═════════════════════════════════════════════════════════════════╝";

  const width = line.length;

  console.log(color(centerText("GNU GRUB  version 2.14", width), "white"));

  console.log(line);

  console.log(centerBoxText(color(" CloudianOS Unified Boot Manager", "gray"), width));
  console.log(
    centerBoxText(
      color(" Software version: ", "gray") + color(config.version, "green"),
      width,
    ),
  );

  console.log(separator);

  menuItems.forEach((item, index) => {
    const isSelected = index === selected;

    const bullet = isSelected ? color("•", "yellow") : color("•", "gray");

    const text = isSelected
      ? color(item.label, "yellow")
      : color(item.label, "gray");

    console.log(boxText(` ${bullet} ${text}`, 87));
  });

  console.log(separator);

  console.log(
    centerBoxText(
      color(
        "Use the ↑ and ↓ keys to select which entry is highlighted.",
        "gray",
      ),
      width,
    ),
  );
  console.log(
    centerBoxText(
      color(
        "Press enter to boot the selected OS.  `e' to edit the commands",
        "gray",
      ),
      width,
    ),
  );
  console.log(
    centerBoxText(
      color("before booting or `c' for a command-line.", "gray"),
      width,
    ),
  );
  console.log(centerBoxText("", width));
  console.log(
    centerBoxText(
      color(
        "The highlighted entry will be started automatically in 30s.",
        "cyan",
      ),
      width,
    ),
  );

  console.log(line_bottom);
}

function startGRUB() {
  readline.emitKeypressEvents(process.stdin);

  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }

  renderMenu();

  process.stdin.on("keypress", async (_, key) => {
    if (!key) return;

    if (key.name === "up") {
      selected--;

      if (selected < 0) {
        selected = menuItems.length - 1;
      }

      renderMenu();
    }

    if (key.name === "down") {
      selected++;

      if (selected >= menuItems.length) {
        selected = 0;
      }

      renderMenu();
    }

    if (key.name === "return") {
      process.stdin.setRawMode(false);
      process.stdin.pause();

      await menuItems[selected].action();
    }

    if (key.ctrl && key.name === "c") {
      process.exit();
    }
  });
}

startGRUB();
