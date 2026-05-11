const { blockIfInvalidVersions } = require("./utils/verifyVersion");
const { verifyOS } = require("./utils/verifyOS");
const config = require("../config");
const chalk = require("chalk");
const getRAMInfo = require("./utils/system/getRAMinfo");
const ram = getRAMInfo();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function startApp() {
  try {
    await blockIfInvalidVersions();
    console.log("[ " + chalk.green("OK") + " ] All system requirements met.");
  } catch (err) {
    console.error(
      "[ " + chalk.red("FAIL") + " ] Failed to start application:",
      err,
    );
    process.exit(1);
  }
}

async function boot() {
  const s = verifyOS();

  console.clear();

  console.log(`CloudianOS BIOS v${config.version}`);
  console.log(`Copyright (C) DeepShark ${new Date().getFullYear()}\n`);

  await sleep(600);
  console.log("[ " + chalk.green("OK") + " ] Initializing system...");

  await sleep(500);
  console.log("[ " + chalk.green("OK") + " ] Detecting hardware...");

  await sleep(500);
  console.log(
    `[ ` + chalk.green("OK") + ` ] OS detected: ` + chalk.yellow(s.os),
  );
  console.log(
    `[ ` + chalk.green("OK") + ` ] Platform: ` + chalk.yellow(s.platform),
  );
  console.log(
    `[ ` +
      chalk.green("OK") +
      ` ] Distribution: ` +
      chalk.yellow(s.distribution),
  );
  console.log(
    `[ ` + chalk.green("OK") + ` ] OS Version: ` + chalk.yellow(s.osVersion),
  );
  console.log(
    `[ ` + chalk.green("OK") + ` ] Build: ` + chalk.yellow(s.osBuild),
  );

  await sleep(600);
  console.log("[ " + chalk.green("OK") + " ] Loading kernel info...");

  await sleep(400);
  console.log(`       Kernel: ` + chalk.yellow(s.kernel));

  await sleep(500);
  console.log("[ " + chalk.green("OK") + " ] Scanning CPU...");
  console.log(
    `       CPU: ` +
      chalk.yellow(s.cpu.model) +
      ` (` +
      chalk.yellow(s.cpu.cores) +
      ` cores)`,
  );

  await sleep(500);
  console.log("[ " + chalk.green("OK") + " ] Detecting graphics subsystem...");
  console.log(`       GPU: ` + chalk.yellow(s.graphicsEngine));

  if (s.gpuExtra) {
    console.log(`       VRAM: ` + chalk.yellow(s.gpuExtra.vram));
    console.log(`       Driver: ` + chalk.yellow(s.gpuExtra.driver));
  }

  await sleep(400);
  console.log("[ " + chalk.green("OK") + " ] Checking virtual environment...");

  if (s.vm) {
    console.log(`       VM detected: ` + chalk.yellow(s.vm));
  } else {
    console.log("       VM: " + chalk.yellow("none"));
  }

  await sleep(400);
  console.log("[ " + chalk.green("OK") + " ] Checking WSL layer...");

  console.log(`       WSL: ` + chalk.yellow(s.wsl ? "yes" : "no"));

  await sleep(400);
  console.log("[ " + chalk.green("OK") + " ] Checking power system...");

  console.log(
    `       Battery: ` +
      chalk.yellow(s.battery.status) +
      ` (` +
      chalk.yellow(s.battery.level) +
      `)`,
  );

  await sleep(500);

  console.log("[ " + chalk.green("OK") + " ] Checking memory subsystem...");

  await sleep(200);
  console.log("       Total Memory: " + chalk.yellow(`${ram.totalGB} GB`));

  await sleep(200);
  console.log("       Used Memory: " + chalk.yellow(`${ram.usedGB} GB`));

  await sleep(200);
  console.log("       Free Memory: " + chalk.yellow(`${ram.freeGB} GB`));

  await sleep(200);
  console.log("       Memory Type: " + chalk.yellow(ram.type));

  await sleep(200);
  console.log("       Memory Speed: " + chalk.yellow(ram.speedMHz));

  await sleep(200);
  console.log("       Manufacturer: " + chalk.yellow(ram.manufacturer));

  await sleep(200);
  if (ram.slots && ram.slots.length > 0) {
    ram.slots.forEach((slot, index) => {
      console.log(
        "       DIMM Slot " +
          chalk.cyan(`#${index + 1}`) +
          ": " +
          chalk.yellow(`${slot.sizeGB} GB ${slot.type}`),
      );
    });
  }

  await sleep(400);
  startApp();

  await sleep(700);
  console.log("[ " + chalk.green("OK") + " ] System check complete.");

  await sleep(400);
  console.log("\nBooting CloudianOS...\n");

  await sleep(400);
  require("./server");
}

boot();
