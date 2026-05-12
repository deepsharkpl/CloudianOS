const { exec } = require("child_process");
const os = require("os");

function run(command) {
    return new Promise((resolve, reject) => {
        exec(command, { maxBuffer: 1024 * 1024 * 50 }, (err, stdout, stderr) => {
            if (err) {
                return reject(stderr || err.message);
            }
            resolve(stdout.trim());
        });
    });
}

async function getStorage() {
    const platform = os.platform();

    try {
        switch (platform) {
            case "win32":
                return await getWindowsStorage();
            case "linux":
                return await getLinuxStorage();
            case "darwin":
                return await getMacStorage();
            default:
                throw new Error(`Unsupported platform: ${platform}`);
        }
    } catch (e) {
        return { success: false, error: e.toString(), platform };
    }
}

async function getWindowsStorage() {
    const raw = await run(
        `powershell -NoProfile -NonInteractive -Command "Get-PhysicalDisk | Select-Object DeviceId,FriendlyName,MediaType,BusType,Size,HealthStatus,OperationalStatus,SerialNumber,FirmwareVersion,UniqueId | ConvertTo-Json -Compress"`
    );

    const partitionsRaw = await run(
        `powershell -NoProfile -NonInteractive -Command "Get-Partition | Where-Object {$_.DriveLetter} | Select-Object DiskNumber,DriveLetter | ForEach-Object { $dl = $_.DriveLetter; $dn = $_.DiskNumber; $drive = Get-PSDrive -Name $dl -PSProvider FileSystem -ErrorAction SilentlyContinue; if ($drive) { [PSCustomObject]@{DiskNumber=$dn; Used=$drive.Used; Free=$drive.Free} } } | ConvertTo-Json -Compress"`
    ).catch(() => "[]");

    const partitions = parseJSON(partitionsRaw, []);

    const usageByDisk = {};
    for (const p of partitions) {
        const dn = p.DiskNumber;
        if (!usageByDisk[dn]) usageByDisk[dn] = { used: 0, free: 0 };
        usageByDisk[dn].used += p.Used || 0;
        usageByDisk[dn].free += p.Free || 0;
    }

    const disks = parseJSON(raw, []).map((d) => {
        const size = d.Size || null;
        const diskUsage = usageByDisk[d.DeviceId] || { used: null, free: null };

        return {
            friendlyName: d.FriendlyName || null,
            mediaType: d.MediaType || null,
            busType: d.BusType || null,
            size,
            sizeHuman: size ? bytesToHuman(size) : null,
            used: diskUsage.used,
            usedHuman: diskUsage.used !== null ? bytesToHuman(diskUsage.used) : null,
            free: diskUsage.free,
            freeHuman: diskUsage.free !== null ? bytesToHuman(diskUsage.free) : null,
            healthStatus: d.HealthStatus || null,
            operationalStatus: d.OperationalStatus || null,
            serialNumber: d.SerialNumber || null,
            firmwareVersion: d.FirmwareVersion || null,
            uniqueId: d.UniqueId || null,
        };
    });

    return { disks };
}

async function getLinuxStorage() {
    const lsblkRaw = await run(
        `lsblk -J -b -o NAME,TYPE,SIZE,MODEL,SERIAL,VENDOR,TRAN,ROTA,RM,STATE`
    ).catch(() => null);

    const blockdevices = lsblkRaw
        ? JSON.parse(lsblkRaw).blockdevices || []
        : [];

    const physicalDisks = blockdevices.filter((d) => d.type === "disk");

    const dfRaw = await run(`df -B1 --output=source,used,avail 2>/dev/null`).catch(() => "");

    const dfMap = parseDfOutput(dfRaw);

    const disks = await Promise.all(
        physicalDisks.map(async (dev) => {
            const name = dev.name;

            const hdparm = await run(`hdparm -I /dev/${name} 2>/dev/null`).catch(() => "");

            const smartRaw = await run(
                `smartctl -j -i -H /dev/${name} 2>/dev/null`
            ).catch(() => "{}");
            const smart = parseJSON(smartRaw, {});

            const model =
                smart?.device?.model_name ||
                extractHdparm(hdparm, "Model Number") ||
                dev.model ||
                (dev.vendor ? dev.vendor.trim() : null);

            const serial =
                smart?.serial_number ||
                extractHdparm(hdparm, "Serial Number") ||
                dev.serial ||
                null;

            const firmware =
                smart?.firmware_version ||
                extractHdparm(hdparm, "Firmware Revision") ||
                null;

            const wwn =
                smart?.wwn
                    ? [
                        smart.wwn.naa,
                        smart.wwn.oui?.toString(16).toUpperCase().padStart(6, "0"),
                        smart.wwn.id?.toString(16).toUpperCase().padStart(10, "0"),
                    ]
                    .filter(Boolean)
                    .join("")
                : null;

            const size = dev.size ? parseInt(dev.size) : null;

            let mediaType = null;
            if (smart?.device?.type) {
                const t = smart.device.type.toLowerCase();
                if (t.includes("nvme")) mediaType = "NVMe";
                else if (t.includes("ssd") || dev.rota === "0") mediaType = "SSD";
                else if (dev.rota === "1") mediaType = "HDD";
            } else {
                mediaType = dev.rota === "0" ? "SSD" : dev.rota === "1" ? "HDD" : null;
            }

            const busMap = { sata: "SATA", nvme: "NVMe", usb: "USB", sas: "SAS", ata: "ATA" };
            const busType = dev.tran
                ? busMap[dev.tran.toLowerCase()] || dev.tran.toUpperCase()
                : null;

            let healthStatus = null;
            let operationalStatus = null;
            const smartHealth = smart?.smart_status;

            if (smartHealth) {
                healthStatus = smartHealth.passed ? "Healthy" : "Unhealthy";
                operationalStatus = smartHealth.passed ? "OK" : "Failed";
            } else if (dev.state) {
                healthStatus = dev.state === "running" ? "Healthy" : "Warning";
                operationalStatus = dev.state;
            }

            const { used, free } = aggregateUsageForDisk(name, dfMap);

            return {
                friendlyName: model,
                mediaType,
                busType,
                size,
                sizeHuman: size ? bytesToHuman(size) : null,
                used,
                usedHuman: used !== null ? bytesToHuman(used) : null,
                free,
                freeHuman: free !== null ? bytesToHuman(free) : null,
                healthStatus,
                operationalStatus,
                serialNumber: serial,
                firmwareVersion: firmware,
                uniqueId: wwn || `/dev/${name}`,
            };
        })
    );

    return { disks };
}

function extractHdparm(output, field) {
    const regex = new RegExp(`${field}:\\s+(.+)`);
    const m = output.match(regex);
    return m ? m[1].trim() : null;
}

function parseDfOutput(raw) {
    const map = {};
    if (!raw) return map;

    const lines = raw.trim().split("\n").slice(1);

    for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length < 3) continue;

        const [source, used, avail] = parts;
        if (!source.startsWith("/dev/")) continue;

        map[source] = {
            used: parseInt(used) || 0,
            free: parseInt(avail) || 0,
        };
    }
    return map;
}

function aggregateUsageForDisk(diskName, dfMap) {
    let used = null;
    let free = null;

    for (const [device, stats] of Object.entries(dfMap)) {
        const devBasename = device.replace("/dev/", "");
        if (devBasename.startsWith(diskName)) {
            used = (used || 0) + stats.used;
            free = (free || 0) + stats.free;
        }
    }

    return { used, free };
}

async function getMacStorage() {
    const plistRaw = await run(`diskutil list -plist`);
    const diskutilInfo = parseMacPlist(plistRaw);
    const wholeDisks = diskutilInfo.WholeDisks || [];

    const dfRaw = await run(`df -k 2>/dev/null`).catch(() => "");
    const dfMap = parseMacDfOutput(dfRaw);

    const disks = await Promise.all(
        wholeDisks.map(async (identifier) => {
            const infoPlist = await run(
                `diskutil info -plist /dev/${identifier}`
            ).catch(() => null);
            if (!infoPlist)
            return {
                friendlyName: identifier,
                mediaType: null,
                busType: null,
                size: null,
                sizeHuman: null,
                used: null,
                usedHuman: null,
                free: null,
                freeHuman: null,
                healthStatus: null,
                operationalStatus: null,
                serialNumber: null,
                firmwareVersion: null,
                uniqueId: `/dev/${identifier}`,
            };

            const info = parseMacPlist(infoPlist);

            const smartRaw = await run(
                `smartctl -j -i -H /dev/${identifier} 2>/dev/null`
            ).catch(() => "{}");

            const smart = parseJSON(smartRaw, {});
            const smartHealth = smart?.smart_status;

            const size = info.TotalSize || null;

            let mediaType = null;
            if (info.SolidState === true) {
                mediaType = info.BusProtocol?.toLowerCase().includes("nvme")
                    ? "NVMe"
                    : "SSD";
            } else if (info.SolidState === false) {
                mediaType = "HDD";
            }

            const busMap = {
                SATA: "SATA",
                NVMe: "NVMe",
                USB: "USB",
                SAS: "SAS",
                Thunderbolt: "Thunderbolt",
            };

            const busType = info.BusProtocol
                ? busMap[info.BusProtocol] || info.BusProtocol
                : null;

            let healthStatus = null;
            let operationalStatus = null;

            if (smartHealth) {
                healthStatus = smartHealth.passed ? "Healthy" : "Unhealthy";
                operationalStatus = smartHealth.passed ? "OK" : "Failed";
            } else if (info.SMARTStatus) {
                healthStatus =
                    info.SMARTStatus === "Verified" ? "Healthy" : info.SMARTStatus;
                operationalStatus =
                info.SMARTStatus === "Verified" ? "OK" : info.SMARTStatus;
            }

            const { used, free } = aggregateUsageForDisk(identifier, dfMap);

            return {
                friendlyName: info.MediaName || identifier,
                mediaType,
                busType,
                size,
                sizeHuman: size ? bytesToHuman(size) : null,
                used,
                usedHuman: used !== null ? bytesToHuman(used) : null,
                free,
                freeHuman: free !== null ? bytesToHuman(free) : null,
                healthStatus,
                operationalStatus,
                serialNumber: smart?.serial_number || null,
                firmwareVersion: smart?.firmware_version || null,
                uniqueId:
                    info.DiskUUID || info.VolumeUUID || `/dev/${identifier}`,
            };
        })
    );

    return { disks };
}


function parseMacDfOutput(raw) {
    const map = {};
    if (!raw) return map;

    const lines = raw.trim().split("\n").slice(1); 
    for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length < 6) continue;

        const [filesystem, , used, avail] = parts;
        if (!filesystem.startsWith("/dev/")) continue;

        map[filesystem] = {
            used: (parseInt(used) || 0) * 1024,
            free: (parseInt(avail) || 0) * 1024,
        };
    }
    return map;
}

function parseMacPlist(xml) {
    const result = {};
    const dictMatch = xml.match(/<dict>([\s\S]*?)<\/dict>/);
    if (!dictMatch) return result;

    const inner = dictMatch[1];
    const keyRegex =
        /<key>([^<]+)<\/key>\s*(?:<([a-z]+)>([^<]*)<\/\2>|<(true|false)\/>)/g;
    let m;

    while ((m = keyRegex.exec(inner)) !== null) {
        const key = m[1];
        const tag = m[2];
        const value = m[3];
        const bool = m[4];

        if (bool !== undefined) result[key] = bool === "true";
        else if (tag === "integer") result[key] = parseInt(value);
        else if (tag === "real") result[key] = parseFloat(value);
        else result[key] = value;
    }

    const wholeMatch = xml.match(
        /<key>WholeDisks<\/key>\s*<array>([\s\S]*?)<\/array>/
    );
    if (wholeMatch) {
        result["WholeDisks"] = [
            ...wholeMatch[1].matchAll(/<string>([^<]+)<\/string>/g),
        ].map((m) => m[1]);
    }

    return result;
}

function parseJSON(raw, fallback) {
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
        return fallback;
    }
}

function bytesToHuman(bytes) {
    if (bytes === null || bytes === undefined || isNaN(bytes)) return null;

    const units = ["B", "KB", "MB", "GB", "TB", "PB"];
    let value = bytes;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex++;
    }
    
    return `${value.toFixed(2)} ${units[unitIndex]}`;
}

module.exports = getStorage;