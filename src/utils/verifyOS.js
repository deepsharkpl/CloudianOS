const os = require("os");
const { execSync } = require("child_process");

let cache = null;
let cacheTime = 0;

function run(cmd) {
  try {
    return execSync(cmd, { timeout: 1500 }).toString();
  } catch {
    return "";
  }
}

function detectOS() {
  const platform = process.platform;

  switch (platform) {
    case "win32":
      return "Windows";
    case "darwin":
      return "macOS";
    case "linux":
      return "Linux";
    default:
      return "Unknown";
  }
}

function detectWSL() {
  if (process.platform !== "linux") return false;
  try {
    const ver = run("cat /proc/version").toLowerCase();
    return ver.includes("microsoft");
  } catch {
    return false;
  }
}

function detectVM() {
  const platform = process.platform;

  if (platform === "win32") {
    const out = run("wmic computersystem get model").toLowerCase();
    if (
      out.includes("virtual") ||
      out.includes("vmware") ||
      out.includes("virtualbox")
    ) {
      return true;
    }
  }

  if (platform === "linux") {
    const out = run("systemd-detect-virt").toLowerCase();
    if (out && out !== "none") return out.trim();
  }

  if (platform === "darwin") {
    const out = run("sysctl -n machdep.cpu.features").toLowerCase();
    if (out.includes("vmm")) return "possible";
  }

  return false;
}

function detectBattery() {
  try {
    const platform = process.platform;

    if (platform === "darwin") {
      const out = run("pmset -g batt").toLowerCase();

      if (out.includes("discharging")) {
        const match = out.match(/(\d+)%/);
        return {
          status: "discharging",
          level: match ? match[1] + "%" : "unknown",
        };
      }

      if (out.includes("charging")) {
        const match = out.match(/(\d+)%/);
        return {
          status: "charging",
          level: match ? match[1] + "%" : "unknown",
        };
      }

      if (out.includes("charged") || out.includes("ac power")) {
        const match = out.match(/(\d+)%/);
        return {
          status: "ac_power",
          level: match ? match[1] + "%" : "unknown",
        };
      }

      return { status: "unknown", level: "unknown" };
    }

    if (platform === "linux") {
      const cap = run("cat /sys/class/power_supply/BAT0/capacity").trim();
      const status = run("cat /sys/class/power_supply/BAT0/status")
        .trim()
        .toLowerCase();

      return {
        status: status || "unknown",
        level: cap ? cap + "%" : "unknown",
      };
    }

    if (platform === "win32") {
      const out = run(
        "wmic path Win32_Battery get EstimatedChargeRemaining, BatteryStatus /value",
      );

      const data = out.split("\n").reduce((acc, line) => {
        const [k, v] = line.split("=");
        if (k && v) acc[k.trim()] = v.trim();
        return acc;
      }, {});

      const level = data.EstimatedChargeRemaining || "unknown";
      const statusCode = data.BatteryStatus;

      let status = "unknown";
      if (statusCode === "1") status = "discharging";
      if (statusCode === "2") status = "ac_power";
      if (statusCode === "3") status = "charging";

      return {
        status,
        level: level !== "unknown" ? level + "%" : "unknown",
      };
    }

    return { status: "unknown", level: "unknown" };
  } catch {
    return { status: "unknown", level: "unknown" };
  }
}

function getWindowsInfo() {
  let data = {};

  try {
    const ps = run(
      'powershell -Command "Get-CimInstance Win32_OperatingSystem | Select-Object Caption,Version,BuildNumber | ConvertTo-Json"',
    );

    data = JSON.parse(ps);
    if (Array.isArray(data)) data = data[0];

    return {
      name: data.Caption || "Windows",
      version: data.Version || "unknown",
      build: data.BuildNumber || "unknown",
      source: "powershell",
    };
  } catch {}

  try {
    const out = run("wmic os get Caption,Version,BuildNumber /value");

    const parsed = out.split("\n").reduce((acc, line) => {
      const [k, v] = line.split("=");
      if (k && v) acc[k.trim()] = v.trim();
      return acc;
    }, {});

    return {
      name: parsed.Caption || "Windows",
      version: parsed.Version || "unknown",
      build: parsed.BuildNumber || "unknown",
      source: "wmic",
    };
  } catch {}

  return {
    name: "Windows",
    version: os.release(),
    build: "unknown",
    source: "fallback",
  };
}

function detectOSDetailed() {
  const platform = process.platform;

  if (platform === "win32") return getWindowsInfo();

  if (platform === "darwin") {
    return {
      name: "macOS",
      version: run("sw_vers -productVersion").trim() || "unknown",
      build: run("sw_vers -buildVersion").trim() || "unknown",
    };
  }

  if (platform === "linux") {
    try {
      const data = run("cat /etc/os-release")
        .split("\n")
        .reduce((acc, line) => {
          const [k, v] = line.split("=");
          if (k && v) acc[k] = v.replace(/"/g, "");
          return acc;
        }, {});

      return {
        name: data.PRETTY_NAME || "Linux",
        id: data.ID || "unknown",
        version: data.VERSION_ID || "unknown",
      };
    } catch {
      return {
        name: "Linux",
        id: "unknown",
        version: "unknown",
      };
    }
  }

  return { name: "Unknown", version: "unknown" };
}

function getKernelVersion() {
  return os.release();
}

function getCPU() {
  const cpus = os.cpus();
  return {
    model: cpus?.[0]?.model || "unknown",
    cores: cpus?.length || 0,
  };
}

function detectGraphicsEngine() {
  const platform = process.platform;

  if (platform === "darwin") {
    const gpu = run("system_profiler SPDisplaysDataType");

    if (gpu.includes("Metal")) return "Apple Metal";
    return "Apple Graphics (CoreGraphics/Metal)";
  }

  if (platform === "win32") {
    let gpu = run(
      'powershell -Command "Get-CimInstance Win32_VideoController | Select-Object -ExpandProperty Name"',
    );

    if (!gpu) {
      gpu = run("wmic path win32_VideoController get name");
    }

    if (!gpu) return "Windows Graphics (unknown)";

    gpu = gpu.toLowerCase();

    if (gpu.includes("nvidia")) return "NVIDIA (DirectX / WDDM)";
    if (gpu.includes("amd")) return "AMD (DirectX / WDDM)";
    if (gpu.includes("intel"))
      return "Intel Integrated Graphics (DirectX / WDDM)";

    return "Windows Graphics (DirectX / WDDM)";
  }

  if (platform === "linux") {
    const gl = run("glxinfo -B").toLowerCase();

    if (gl.includes("vulkan")) return "Vulkan / OpenGL";
    if (gl) return "OpenGL";

    const pci = run("lspci | grep -i vga").toLowerCase();
    if (pci.includes("nvidia")) return "NVIDIA (Linux driver)";
    if (pci.includes("amd")) return "AMD (Linux driver)";
    if (pci.includes("intel")) return "Intel Integrated Graphics";

    return "Linux Graphics (unknown)";
  }

  return "Unknown Graphics Engine";
}

function getGPUExtra() {
  if (process.platform !== "win32") return null;

  const mem = run(
    'powershell -Command "Get-CimInstance Win32_VideoController | Select-Object -ExpandProperty AdapterRAM"',
  );
  const driver = run(
    'powershell -Command "Get-CimInstance Win32_VideoController | Select-Object -ExpandProperty DriverVersion"',
  );

  
  return {
    vram: mem ? `${Math.round(Number(mem) / 1024 / 1024)} MB` : "unknown",
    driver: driver ? driver.replace(/\r?\n/g, "").trim() : "unknown",
  };
}

function verifyOS() {
  if (cache && Date.now() - cacheTime < 5000) return cache;

  const baseOS = detectOS();
  const detailed = detectOSDetailed();

  const result = {
    os: baseOS,
    platform: process.platform,
    kernel: getKernelVersion(),
    cpu: getCPU(),
    graphicsEngine: detectGraphicsEngine(),
    distribution: detailed.name,
    distroId: detailed.id,
    osVersion: detailed.version,
    osBuild: detailed.build,
    wsl: detectWSL(),
    vm: detectVM(),
    battery: detectBattery(),
    gpuExtra: getGPUExtra(),
  };

  cache = result;
  cacheTime = Date.now();

  return result;
}

module.exports = {
  detectOS,
  detectGraphicsEngine,
  verifyOS,
  detectOSDetailed,
};
