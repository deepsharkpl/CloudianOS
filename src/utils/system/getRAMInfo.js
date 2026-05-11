const os = require("os");
const { execSync } = require("child_process");

function bytesToGB(bytes) {
  return Math.round(bytes / 1024 / 1024 / 1024);
}

function run(cmd) {
  try {
    return execSync(cmd, {
      timeout: 3000,
      windowsHide: true,
      stdio: ["pipe", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    return "";
  }
}

function getRAMInfo() {
  const total = os.totalmem();

  let free = os.freemem();

  if (process.platform === "darwin") {
    try {
      const vm = run("vm_stat");
      const freeMatch = vm.match(/Pages free:\s+(\d+)\./);
      const inactiveMatch = vm.match(/Pages inactive:\s+(\d+)\./);
      const speculativeMatch = vm.match(/Pages speculative:\s+(\d+)\./);
      const pageSize = 4096;
      const freePages = Number(freeMatch?.[1] || 0);
      const inactivePages = Number(inactiveMatch?.[1] || 0);
      const speculativePages = Number(speculativeMatch?.[1] || 0);

      free = (freePages + inactivePages + speculativePages) * pageSize;
    } catch {}
  }

  const used = total - free;

  const ram = {
    totalGB: bytesToGB(total),
    freeGB: bytesToGB(free),
    usedGB: bytesToGB(used),
    type: "unknown",
    speedMHz: "unknown",
    manufacturer: "unknown",
    slots: [],
  };

  if (process.platform === "win32") {
    try {
      let output = "";

      output = run(
        'powershell -Command "Get-CimInstance Win32_PhysicalMemory | Select Manufacturer,SMBIOSMemoryType,Speed,ConfiguredClockSpeed,Capacity,BankLabel | ConvertTo-Json -Compress"',
      );

      if (!output) {
        output = run(
          "wmic memorychip get manufacturer,speed,configuredclockspeed,capacity,banklabel,SMBIOSMemoryType /format:list",
        );
      }

      if (output) {
        let modules = [];

        try {
          const parsed = JSON.parse(output);

          modules = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          const chunks = output
            .split("\n\n")
            .map((x) => x.trim())
            .filter(Boolean);

          modules = chunks.map((chunk) => {
            const obj = {};

            chunk.split("\n").forEach((line) => {
              const [k, v] = line.split("=");

              if (k && v) {
                obj[k.trim()] = v.trim();
              }
            });

            return obj;
          });
        }

        const memoryTypes = {
          20: "DDR",
          21: "DDR2",
          24: "DDR3",
          26: "DDR4",
          34: "DDR5",
        };

        ram.slots = modules.map((m) => ({
          slot: m.BankLabel || "unknown",
          sizeGB: bytesToGB(Number(m.Capacity || 0)),
          manufacturer: m.Manufacturer || "unknown",
          speedMHz: m.ConfiguredClockSpeed || m.Speed || "unknown",
          type: memoryTypes[Number(m.SMBIOSMemoryType)] || "unknown",
        }));

        if (ram.slots.length > 0) {
          ram.type = ram.slots[0].type;
          ram.speedMHz = ram.slots[0].speedMHz;
          ram.manufacturer = ram.slots[0].manufacturer;
        }
      }
    } catch {}
  }

  if (process.platform === "linux") {
    try {
      let output = run("sudo dmidecode --type memory");

      if (!output) {
        output = run("dmidecode --type memory");
      }

      if (output) {
        const devices = output.split("Memory Device");

        ram.slots = devices
          .map((device) => {
            const size = device.match(/Size:\s(.+)/);
            const speed = device.match(/Speed:\s(.+)/);
            const type = device.match(/Type:\s(.+)/);
            const manufacturer = device.match(/Manufacturer:\s(.+)/);
            const locator = device.match(/Locator:\s(.+)/);

            if (!size || size[1].includes("No Module")) {
              return null;
            }

            return {
              slot: locator?.[1]?.trim() || "unknown",
              sizeGB: parseInt(size[1]) || 0,
              manufacturer: manufacturer?.[1]?.trim() || "unknown",
              speedMHz: speed?.[1]?.trim() || "unknown",
              type: type?.[1]?.trim() || "unknown",
            };
          })
          .filter(Boolean);

        if (ram.slots.length > 0) {
          ram.type = ram.slots[0].type;
          ram.speedMHz = ram.slots[0].speedMHz;
          ram.manufacturer = ram.slots[0].manufacturer;
        }
      }
    } catch {}
  }

  if (process.platform === "darwin") {
    try {
      const chip = run("sysctl -n machdep.cpu.brand_string");
      const cpu = run("sysctl -n machdep.cpu.brand_string");
      const model = run("sysctl -n hw.model");
      const isAppleSilicon = cpu.includes("Apple") || model.includes("Mac");

      ram.type = isAppleSilicon ? "Unified Memory" : "DDR";
      ram.manufacturer = isAppleSilicon ? "Apple" : "unknown";

      let estimatedSpeed = "unknown";

      if (chip.includes("M1") || chip.includes("M2")) {
        estimatedSpeed = "LPDDR5";
      }

      if (chip.includes("M3") || chip.includes("M4")) {
        estimatedSpeed = "LPDDR5X";
      }

      ram.speedMHz = estimatedSpeed;
      ram.slots = [
        {
          slot: "Integrated",
          sizeGB: ram.totalGB,
          manufacturer: ram.manufacturer,
          speedMHz: ram.speedMHz,
          type: ram.type,
        },
      ];
    } catch {}
  }

  return ram;
}

module.exports = getRAMInfo;
