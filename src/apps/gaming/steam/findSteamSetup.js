const fs = require('fs');
const path = require('path');
const os = require('os');

const TARGET_DIR = 'Blueberry';
const TARGET_FILE = 'SteamSetup.exe';

function getCandidateRoots() {
  const home = os.homedir();
  const platform = process.platform;
  const roots = [];

  roots.push(process.cwd());
  roots.push(path.resolve(process.cwd(), '..'));
  roots.push(__dirname);
  roots.push(path.resolve(__dirname, '..'));
  roots.push(home);

  if (platform === 'win32') {
    roots.push(
      path.join(home, 'Documents'),
      path.join(home, 'Desktop'),
      path.join(home, 'Downloads'),
      'C:\\Projects',
      'C:\\Dev',
      'C:\\',
      'D:\\',
      'D:\\Projects',
    );
  } else if (platform === 'darwin') {
    roots.push(
      path.join(home, 'Documents'),
      path.join(home, 'Desktop'),
      path.join(home, 'Downloads'),
      path.join(home, 'Developer'),
      '/Volumes',
    );
  } else {
    roots.push(
      path.join(home, 'Documents'),
      path.join(home, 'Desktop'),
      path.join(home, 'Downloads'),
      path.join(home, 'projects'),
      path.join(home, 'dev'),
      '/opt',
      '/srv',
    );
  }

  return [...new Set(roots)];
}

function findBlueberryDir(root, maxDepth = 3) {
  const results = [];

  function walk(dir, depth) {
    if (depth > maxDepth) return;

    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      if (entry.name === TARGET_DIR) {
        results.push(path.join(dir, entry.name));
        continue;
      }

      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;

      walk(path.join(dir, entry.name), depth + 1);
    }
  }

  walk(root, 0);
  return results;
}

function findFileInDir(dir, filename, maxDepth = 5) {
  const results = [];

  function walk(current, depth) {
    if (depth > maxDepth) return;

    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);

      if (
        entry.isFile() &&
        entry.name.toLowerCase() === filename.toLowerCase()
      ) {
        results.push(fullPath);
        continue;
      }

      if (
        entry.isDirectory() &&
        !entry.name.startsWith('.') &&
        entry.name !== 'node_modules'
      ) {
        walk(fullPath, depth + 1);
      }
    }
  }

  walk(dir, 0);
  return results;
}

function findSteamSetup() {
  const platform = process.platform;
  const roots = getCandidateRoots();
  const foundPaths = [];
  let blueberryDir = null;

  for (const root of roots) {
    try {
      fs.accessSync(root);
    } catch {
      continue;
    }

    const blueberryDirs = findBlueberryDir(root, 3);

    for (const bDir of blueberryDirs) {
      const matches = findFileInDir(bDir, TARGET_FILE, 5);

      if (matches.length > 0) {
        foundPaths.push(...matches);
        if (!blueberryDir) blueberryDir = bDir;
      }
    }

    if (foundPaths.length > 0) break;
  }

  const unique = [...new Set(foundPaths)];

  return {
    found: unique.length > 0,
    path: unique[0] ?? null,
    allPaths: unique,
    blueberryDir,
    platform,
    searchedRoots: roots,
  };
}

module.exports = { findSteamSetup };
