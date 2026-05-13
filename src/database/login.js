const { openSystemDB } = require('./db');
const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function login(username, password, deviceName = 'Unknown Device') {
  const db = openSystemDB();
  const hashedPassword = hashPassword(password);

  const user = db
    .prepare(`SELECT * FROM users WHERE username = ?`)
    .get(username);

  if (!user) {
    throw new Error('User not found');
  }

  if (user.password !== hashedPassword) {
    throw new Error('Invalid password');
  }

  db.prepare(
    `INSERT OR REPLACE INTO session (id, userId, username, deviceName, loginTime)
     VALUES (?, ?, ?, ?, ?)`,
  ).run(
    'current',
    user.id,
    user.username,
    deviceName,
    new Date().toISOString(),
  );

  return {
    success: true,
    user: {
      id: user.id,
      username: user.username,
      deviceName: user.deviceName,
      createdAt: user.createdAt,
    },
  };
}

module.exports = {
  login,
};
