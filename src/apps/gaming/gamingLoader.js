const fs = require('fs');
const path = require('path');

const GAMING_DIR = path.join(__dirname);

function findSetupModule(dir) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const found = entries.find(
      (e) => e.isFile() && /^find.+setup\.js$/i.test(e.name),
    );
    return found ? path.join(dir, found.name) : null;
  } catch {
    return null;
  }
}

function loadApp(slug) {
  const dir = path.join(GAMING_DIR, slug);
  const metaPath = path.join(dir, 'metadata.json');
  const setupModPath = findSetupModule(dir);

  let meta;
  try {
    meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  } catch {
    return null;
  }

  const iconRelative = meta.icon ?? './logo.png';
  const iconAbsolute = path.resolve(dir, iconRelative);
  const iconExists = fs.existsSync(iconAbsolute);

  let setupResult = { found: false, path: null, dir };
  if (setupModPath) {
    try {
      delete require.cache[require.resolve(setupModPath)];
      const mod = require(setupModPath);

      const fn = Object.values(mod).find((v) => typeof v === 'function');
      if (fn) setupResult = fn();
    } catch (err) {
      setupResult = { found: false, path: null, dir, error: err.message };
    }
  }

  return {
    slug,
    name: meta.name ?? slug,
    iconPath: iconExists ? iconAbsolute : null,
    iconRelative: `/${slug}/icon`,
    setupFound: setupResult.found,
    setupPath: setupResult.path,
    appDir: dir,
  };
}

function loadAllApps() {
  let slugs;
  try {
    slugs = fs
      .readdirSync(GAMING_DIR, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name);
  } catch {
    return [];
  }

  return slugs.map((slug) => loadApp(slug)).filter(Boolean);
}

module.exports = { loadAllApps, loadApp, GAMING_DIR };
