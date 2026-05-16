const os = require('os');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const buildSwiftScript = require('./buildSwiftScript');

function macScan(timeoutMs) {
  return new Promise((resolve, reject) => {
    const scanSecs = Math.max(Math.floor(timeoutMs / 1000) - 1, 2);
    const script = buildSwiftScript(scanSecs);
    const tmpFile = path.join(os.tmpdir(), `bt_scan_${Date.now()}.swift`);

    fs.writeFileSync(tmpFile, script, 'utf8');

    let stdout = '';
    let stderr = '';
    const proc = spawn('swift', [tmpFile], { timeout: timeoutMs + 6_000 });

    proc.stdout.on('data', (d) => {
      stdout += d.toString();
    });
    proc.stderr.on('data', (d) => {
      stderr += d.toString();
    });

    proc.on('close', () => {
      fs.unlink(tmpFile, () => {});
      try {
        resolve(JSON.parse(stdout.trim() || '[]'));
      } catch {
        reject(
          new Error(`Błąd parsowania wyniku Swift: ${stderr.slice(0, 400)}`),
        );
      }
    });

    proc.on('error', (err) => {
      fs.unlink(tmpFile, () => {});
      reject(
        new Error(
          `Nie można uruchomić swift. Zainstaluj Xcode CLI: xcode-select --install\n${err.message}`,
        ),
      );
    });
  });
}

module.exports = macScan;
