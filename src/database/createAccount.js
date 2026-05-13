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

    db.prepare(
      `
      INSERT OR REPLACE INTO settings (
        key,
        homeFolder,
        networkType, networkSsid, networkPassword, networkAutoConnect,
        location,
        theme, wallpaper, desktopLayout,
        timezone, timeFormat,
        language, keyboardLayout,
        region, numberFormat, dateFormat,
        autoUpdates, syncSettings, backups
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `,
    ).run(
      `user:${userId}`,
      homePath,
      data.network?.type || 'wifi',
      data.network?.ssid || null,
      data.network?.password || null,
      data.network?.autoConnect ? 1 : 0,
      data.location || null,
      data.theme || 'light',
      data.wallpaper || null,
      data.desktopLayout || 'default',
      data.timezone || 'UTC',
      data.timeFormat || '24h',
      data.language || 'en',
      data.keyboardLayout || 'us',
      data.region || 'US',
      data.numberFormat || '1,234.56',
      data.dateFormat || 'YYYY-MM-DD',
      (data.autoUpdates ?? true) ? 1 : 0,
      (data.syncSettings ?? true) ? 1 : 0,
      (data.backups ?? false) ? 1 : 0,
    );

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
