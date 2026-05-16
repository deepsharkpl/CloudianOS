const run = require('../../utils/run');

async function winScan(timeoutMs) {
  const secs = Math.floor(timeoutMs / 1000);
  const ps = [
    'Add-Type -AssemblyName System.Runtime.WindowsRuntime;',
    '$w=[Windows.Devices.Bluetooth.Advertisement.BluetoothLEAdvertisementWatcher,',
    'Windows.Devices.Bluetooth,ContentType=WindowsRuntime]::new();',
    '$d=[System.Collections.Concurrent.ConcurrentDictionary[string,object]]::new();',
    '$w.add_Received({param($s,$e)',
    '  $a=$e.BluetoothAddress.ToString("X12");',
    '  $d.TryAdd($a,@{address=$a;name=$e.Advertisement.LocalName;rssi=$e.RawSignalStrengthInDBm})|Out-Null',
    '});',
    `$w.Start();Start-Sleep -Seconds ${secs};$w.Stop();`,
    '$d.Values|ConvertTo-Json -Compress',
  ].join(' ');

  try {
    const out = await run(`powershell -NoProfile -Command "${ps}"`, {
      timeout: timeoutMs + 10_000,
    });
    const parsed = JSON.parse(out || '[]');
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [];
  }
}

module.exports = winScan;
