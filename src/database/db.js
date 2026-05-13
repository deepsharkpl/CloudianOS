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
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      loginMethods TEXT NOT NULL DEFAULT '["password"]',
      deviceName TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS session (
      id TEXT PRIMARY KEY,
      userId INTEGER,
      username TEXT,
      deviceName TEXT,
      loginTime TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS files (
      path TEXT PRIMARY KEY,
      owner INTEGER,
      createdAt TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_files_owner ON files (owner);
  `);

  dbInstance = db;
  return dbInstance;
}

module.exports = {
  openSystemDB,
};
