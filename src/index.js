const { blockIfInvalidVersions } = require("./utils/verifyVersion");
const { verifyOS } = require("./utils/verifyOS");
const config = require("../config");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function startApp() {
  try {
    await blockIfInvalidVersions();
    console.log("[ OK ] All system requirements met.");
  } catch (err) {
    console.error("[ FAIL ] Failed to start application:", err);
    process.exit(1);
  }
}

async function boot() {
  const s = verifyOS();

  console.clear();

  console.log(`CloudianOS BIOS v${config.version}`);
  console.log(`Copyright (C) DeepShark ${new Date().getFullYear()}\n`);

  await sleep(600);
  console.log("[ OK ] Initializing system...");

  await sleep(500);
  console.log("[ OK ] Detecting hardware...");

  await sleep(500);
  console.log(`[ OK ] OS detected: ${s.os}`);
  console.log(`[ OK ] Platform: ${s.platform}`);
  console.log(`[ OK ] Distribution: ${s.distribution}`);
  console.log(`[ OK ] OS Version: ${s.osVersion}`);
  console.log(`[ OK ] Build: ${s.osBuild}`);

  await sleep(600);
  console.log("[ OK ] Loading kernel info...");

  await sleep(400);
  console.log(`       Kernel: ${s.kernel}`);

  await sleep(500);
  console.log("[ OK ] Scanning CPU...");
  console.log(`       CPU: ${s.cpu.model} (${s.cpu.cores} cores)`);

  await sleep(500);
  console.log("[ OK ] Detecting graphics subsystem...");
  console.log(`       GPU: ${s.graphicsEngine}`);

  if (s.gpuExtra) {
    console.log(`       VRAM: ${s.gpuExtra.vram}`);
    console.log(`       Driver: ${s.gpuExtra.driver}`);
  }

  await sleep(400);
  console.log("[ OK ] Checking virtual environment...");

  if (s.vm) {
    console.log(`       VM detected: ${s.vm}`);
  } else {
    console.log("       VM: none");
  }

  await sleep(400);
  console.log("[ OK ] Checking WSL layer...");

  console.log(`       WSL: ${s.wsl ? "yes" : "no"}`);

  await sleep(400);
  console.log("[ OK ] Checking power system...");

  console.log(`       Battery: ${s.battery.status} (${s.battery.level})`);

  await sleep(400);
  startApp();

  await sleep(700);
  console.log("[ OK ] System check complete.");

  await sleep(400);
  console.log("\nBooting CloudianOS...\n");
}

boot();
