function parseSystemProfiler(output) {
  const lines = output.split('\n');
  const networks = [];
  let current = null;
  let inNetworksSection = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const indent = rawLine.search(/\S/);

    if (line.includes('Wi-Fi Networks') || line.includes('Other Local Wi-Fi Networks')) {
      inNetworksSection = true;
      continue;
    }

    if (!inNetworksSection) continue;

    const knownKeys = ['Security', 'Channel', 'Network Name', 'BSS', 'Country', 'PHY'];
    const isKnownKey = knownKeys.some(k => line.startsWith(k + ':'));

    if (indent === 12 && line.endsWith(':') && !isKnownKey) {
      if (current) networks.push(current);
      current = { ssid: line.slice(0, -1) };
      continue;
    }

    if (!current) continue;

    if (line.startsWith('Security:')) {
      current.security = line.split(':')[1].trim();
    }
    if (line.startsWith('Channel:')) {
      current.channel = line.split(':')[1].trim();
    }
  }

  if (current) networks.push(current);
  return networks;
}

module.exports = parseSystemProfiler;