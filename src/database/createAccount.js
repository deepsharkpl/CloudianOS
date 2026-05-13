const { openSystemDB } = require('./db');
const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function createAccount(data) {
  const db = openSystemDB();
  const hashedPassword = hashPassword(data.password);
  const now = new Date().toISOString();

  const createAccountTx = db.transaction(() => {
    const userResult = db
      .prepare(
        `INSERT INTO users (username, password, loginMethods, deviceName, createdAt)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .run(
        data.username,
        hashedPassword,
        JSON.stringify(data.loginMethods || ['password']),
        data.deviceName,
        now,
      );

    const userId = userResult.lastInsertRowid;
    const homePath = `/home/${data.username}`;

    db.prepare(
      `INSERT INTO files (path, owner, createdAt) VALUES (?, ?, ?)`,
    ).run(homePath, userId, now);

    const settingsValue = {
      homeFolder: homePath,
      network: {
        type: data.network?.type || 'wifi',
        ssid: data.network?.ssid || null,
        password: data.network?.password || null,
        autoConnect: data.network?.autoConnect || false,
      },
      location: data.location || null,
      appearance: {
        theme: data.theme || 'light',
        wallpaper: data.wallpaper || null,
        desktopLayout: data.desktopLayout || 'default',
      },
      time: {
        timezone: data.timezone || 'UTC',
        format: data.timeFormat || '24h',
      },
      language: data.language || 'en',
      keyboardLayout: data.keyboardLayout || 'us',
      region: {
        region: data.region || 'US',
        numberFormat: data.numberFormat || '1,234.56',
        dateFormat: data.dateFormat || 'YYYY-MM-DD',
      },
      system: {
        autoUpdates: data.autoUpdates ?? true,
        syncSettings: data.syncSettings ?? true,
        backups: data.backups ?? false,
      },
    };

    db.prepare(
      `INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`,
    ).run(`user:${userId}`, JSON.stringify(settingsValue));

    db.prepare(
      `INSERT OR REPLACE INTO session (id, userId, username, deviceName, loginTime)
       VALUES (?, ?, ?, ?, ?)`,
    ).run('current', userId, data.username, data.deviceName, now);
  });

  createAccountTx();
  return { success: true };
}

module.exports = {
  createAccount,
};
