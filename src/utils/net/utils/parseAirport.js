function parseAirport(stdout) {
  const lines = stdout.split('\n').slice(1);

  return lines.filter(Boolean).map((line) => {
    const parts = line.trim().split(/\s+/);

    return {
      ssid: parts[0],
      bssid: parts[1],
      signal: parts[2],
      channel: parts[3],
      security: parts.slice(6).join(' '),
    };
  });
}

module.exports = parseAirport;
