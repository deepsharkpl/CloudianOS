const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'Blueberry.db');
let dbInstance = null;

function openSystemDB() {
  if (dbInstance) {
    return dbInstance;
  }

  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      username      TEXT    NOT NULL UNIQUE,
      password      TEXT    NOT NULL,
      loginMethods  TEXT    NOT NULL DEFAULT '["password"]',
      deviceName    TEXT,
      createdAt     TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key               TEXT    PRIMARY KEY,
      homeFolder        TEXT,
      networkType       TEXT    NOT NULL DEFAULT 'wifi',
      networkSsid       TEXT,
      networkPassword   TEXT,
      networkAutoConnect INTEGER NOT NULL DEFAULT 0,  -- 0 = false, 1 = true
      location          TEXT,
      theme             TEXT    NOT NULL DEFAULT 'light',
      wallpaper         TEXT,
      desktopLayout     TEXT    NOT NULL DEFAULT 'default',
      timezone          TEXT    NOT NULL DEFAULT 'UTC',
      timeFormat        TEXT    NOT NULL DEFAULT '24h',
      language          TEXT    NOT NULL DEFAULT 'en',
      keyboardLayout    TEXT    NOT NULL DEFAULT 'us',
      region            TEXT    NOT NULL DEFAULT 'US',
      numberFormat      TEXT    NOT NULL DEFAULT '1,234.56',
      dateFormat        TEXT    NOT NULL DEFAULT 'YYYY-MM-DD',
      autoUpdates       INTEGER NOT NULL DEFAULT 1,
      syncSettings      INTEGER NOT NULL DEFAULT 1,
      backups           INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS session (
      id          TEXT    PRIMARY KEY,
      userId      INTEGER NOT NULL REFERENCES users(id),
      username    TEXT    NOT NULL,
      deviceName  TEXT,
      loginTime   TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS files (
      path        TEXT    PRIMARY KEY,
      owner       INTEGER NOT NULL REFERENCES users(id),
      createdAt   TEXT    NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_files_owner ON files (owner);
  `);

  dbInstance = db;
  return dbInstance;
}

module.exports = {
  openSystemDB,
};
