const run = require('../../utils/run');

async function macCheckBluetooth() {
  try {
    const out = await run(
      'system_profiler SPBluetoothDataType -json 2>/dev/null',
    );
    const data = JSON.parse(out);
    const bt = data?.SPBluetoothDataType?.[0];

    if (!bt) return { available: false, state: 'no_adapter' };

    const ctrlProps = bt?.controller_properties ?? {};
    const stateStr = ctrlProps?.controller_state ?? '';
    const powered =
      stateStr.toLowerCase().includes('on') || !!bt?.local_device_name;

    return {
      available: true,
      powered,
      state: powered ? 'poweredOn' : 'poweredOff',
      name: bt?.local_device_name ?? null,
      address: ctrlProps?.controller_address ?? null,
      firmware: ctrlProps?.controller_firmwareVersion ?? null,
    };
  } catch {
    return { available: false, state: 'error_reading_profiler' };
  }
}

module.exports = macCheckBluetooth;
