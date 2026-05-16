const run = require('../../utils/run');

async function winCheckBluetooth() {
  const ps = [
    'Add-Type -AssemblyName System.Runtime.WindowsRuntime;',
    'try {',
    '  $r=[Windows.Devices.Radios.Radio,Windows.System.Devices,ContentType=WindowsRuntime];',
    '  $radios=[Windows.Devices.Radios.Radio]::GetRadiosAsync().GetAwaiter().GetResult();',
    '  $bt=$radios|Where-Object{$_.Kind -eq 1}|Select-Object -First 1;',
    '  if($bt){@{available=$true;state=$bt.State.ToString();name=$bt.Name}|ConvertTo-Json}',
    '  else {@{available=$false;state="no_adapter"}|ConvertTo-Json}',
    '} catch { @{available=$false;state="error";message=$_.Exception.Message}|ConvertTo-Json }',
  ].join(' ');

  try {
    const out = await run(`powershell -NoProfile -Command "${ps}"`);
    return JSON.parse(out);
  } catch {
    return {
      available: false,
      state: 'powershell_error',
      hint: 'Wymagany Windows 10 v1809+ i PowerShell 5+',
    };
  }
}

module.exports = winCheckBluetooth;
