const fs = require('fs');
const path = require('path');
const { createReporter } = require('./report');
const {
  DXVK_DLLS_X64,
  DXVK_DLLS_X32,
  DXVK_CACHE_DIR,
} = require('../constants');
const { getLatestRelease } = require('../github');
const { downloadFile } = require('../download');
const { extractTar } = require('../extract');

class DxvkInstaller {
  constructor({ prefixManager, log, writeRegistryOverrides }) {
    this.prefixManager = prefixManager;
    this.log = log;
    this.writeRegistryOverrides = writeRegistryOverrides;
    this.activeInstalls = new Map();
  }

  isInstalling(prefixId) {
    const status = this.activeInstalls.get(prefixId);
    return status && status !== 'done' && status !== 'error';
  }

  getStatus(prefixId) {
    return this.activeInstalls.get(prefixId) ?? 'idle';
  }

  async install(prefixIdOrName, onProgress) {
    const prefix = this.prefixManager.getPrefix(prefixIdOrName);

    if (!prefix) {
      throw new Error(`Prefix "${prefixIdOrName}" not found`);
    }

    if (this.isInstalling(prefix.id)) {
      throw new Error(
        `DXVK install already in progress for prefix "${prefix.name}"`,
      );
    }

    this.activeInstalls.set(prefix.id, 'fetching_release');
    const report = createReporter(
      prefix,
      this.log,
      onProgress,
      this.activeInstalls,
    );

    try {
      report('fetching_release', 'Fetching latest DXVK release...', 5);

      const { version, tarUrl } = await getLatestRelease();
      report('fetching_release', `Found DXVK v${version}`, 10, { version });

      const cacheDir = path.join(DXVK_CACHE_DIR, version);
      const tarPath = path.join(DXVK_CACHE_DIR, `dxvk-${version}.tar.gz`);

      fs.mkdirSync(DXVK_CACHE_DIR, { recursive: true });

      if (!fs.existsSync(cacheDir)) {
        report('downloading', `Downloading DXVK v${version}...`, 15, {
          version,
        });

        await downloadFile(tarUrl, tarPath, (pct) => {
          report(
            'downloading',
            `Downloading DXVK v${version} (${pct}%)`,
            15 + Math.round(pct * 0.4),
            { version },
          );
        });

        report('extracting', 'Extracting archive...', 55, {
          version,
        });

        await extractTar(tarPath, cacheDir);
        fs.unlinkSync(tarPath);
      } else {
        report('extracting', `Using cached DXVK v${version}`, 55, { version });
      }

      report(
        'installing',
        `Installing DXVK into prefix "${prefix.name}"...`,
        65,
        { version },
      );

      const system32 = path.join(prefix.path, 'drive_c/windows/system32');
      const syswow64 = path.join(prefix.path, 'drive_c/windows/syswow64');

      fs.mkdirSync(system32, { recursive: true });
      fs.mkdirSync(syswow64, { recursive: true });

      const x64Dir = path.join(cacheDir, 'x64');
      const x32Dir = path.join(cacheDir, 'x32');

      let installed = 0;
      const totalDlls = DXVK_DLLS_X64.length + DXVK_DLLS_X32.length;

      for (const dll of DXVK_DLLS_X64) {
        const src = path.join(x64Dir, dll);

        if (fs.existsSync(src)) {
          fs.copyFileSync(src, path.join(system32, dll));
          installed++;

          report(
            'installing',
            `Installed ${dll} (x64)`,
            65 + Math.round((installed / totalDlls) * 25),
            { version },
          );
        }
      }

      for (const dll of DXVK_DLLS_X32) {
        const src = path.join(x32Dir, dll);

        if (fs.existsSync(src)) {
          fs.copyFileSync(src, path.join(syswow64, dll));
          installed++;

          report(
            'installing',
            `Installed ${dll} (x32)`,
            65 + Math.round((installed / totalDlls) * 25),
            { version },
          );
        }
      }

      report('installing', 'Writing DLL overrides...', 92, { version });

      await this.writeRegistryOverrides(prefix.path, DXVK_DLLS_X64);

      const prefixes = this.prefixManager.listPrefixes();
      const idx = prefixes.findIndex((p) => p.id === prefix.id);

      if (idx !== -1) {
        prefixes[idx].dxvk = true;
        prefixes[idx].updatedAt = new Date();
      }

      this.activeInstalls.set(prefix.id, 'done');

      report('done', `DXVK v${version} installed successfully`, 100, {
        version,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);

      this.log.error(`DXVK install failed: ${msg}`);
      this.activeInstalls.set(prefix.id, 'error');

      onProgress({
        status: 'error',
        message: msg,
        percent: 0,
        error: msg,
      });

      throw err;
    }
  }

  async checkInstalled(prefixIdOrName) {
    const prefix = this.prefixManager.getPrefix(prefixIdOrName);

    if (!prefix) {
      return { installed: false };
    }

    const system32 = path.join(prefix.path, 'drive_c/windows/system32');
    const dxgiPath = path.join(system32, 'dxgi.dll');

    if (!fs.existsSync(dxgiPath)) {
      return { installed: false };
    }

    let version;

    try {
      const dirs = fs.readdirSync(DXVK_CACHE_DIR);
      version = dirs.find((d) => !d.endsWith('.tar.gz'));
    } catch {}

    return {
      installed: true,
      version,
    };
  }
}

module.exports = {
  DxvkInstaller,
};
