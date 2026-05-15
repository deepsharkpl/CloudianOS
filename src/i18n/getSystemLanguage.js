const { execSync } = require('child_process');
const os = require('os');

function getSystemLanguage() {
  const platform = os.platform();

  try {
    if (platform === 'win32') {
      const lang = execSync(
        'powershell -NoProfile -Command "Get-Culture | Select-Object -ExpandProperty Name"',
        { encoding: 'utf8' },
      ).trim();

      if (lang) return normalize(lang);
    }

    if (platform === 'darwin') {
      const lang = execSync('defaults read -g AppleLocale', {
        encoding: 'utf8',
      }).trim();

      if (lang) return normalize(lang);
    }

    if (platform === 'linux') {
      const output = execSync('locale', { encoding: 'utf8' });

      const match =
        output.match(/LANG=(.*)/) || output.match(/LC_MESSAGES=(.*)/);

      if (match?.[1]) return normalize(match[1]);
    }
  } catch {}

  const intl = Intl.DateTimeFormat().resolvedOptions().locale;
  if (intl) return normalize(intl);

  return 'en-US';
}

function normalize(lang) {
  return lang.replace('.UTF-8', '').replace('_', '-').trim();
}

module.exports = { getSystemLanguage };
