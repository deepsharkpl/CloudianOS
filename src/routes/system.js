const { openSystemDB } = require('../database/db');

const express = require('express');
const router = express.Router();

const crypto = require('crypto');

let firstVisit = true;
let loggedInUserId = null;

router.get('/', (req, res) => {
  const db = openSystemDB();

  if (!hasAccount()) {
    if (firstVisit) {
      firstVisit = false;

      if (req.query.content === '1') {
        return res.render('setup', { layout: false });
      }

      return res.render('loading', {
        destination: '/',
        contentUrl: '/?content=1',
      });
    }

    return res.render('setup');
  }

  if (isLoggedIn()) {
    const view = 'desktop';

    if (firstVisit) {
      firstVisit = false;
      if (req.query.content === '1') {
        return res.render(view, { layout: false });
      }

      return res.render('loading', {
        destination: '/',
        contentUrl: '/?content=1',
      });
    }

    return res.render(view);
  }

  const users = db.prepare('SELECT id, username FROM users').all();

  if (firstVisit) {
    firstVisit = false;

    if (req.query.content === '1') {
      return res.render('login', {
        layout: false,
        users,
      });
    }

    return res.render('loading', {
      destination: '/',
      contentUrl: '/?content=1',
    });
  }

  return res.render('login', { users });
});

router.post('/', (req, res) => {
  const { username, password } = req.body;
  const db = openSystemDB();

  const user = db
    .prepare('SELECT * FROM users WHERE username = ?')
    .get(username);

  const hash = crypto.createHash('sha256').update(password).digest('hex');

  if (!user || user.password !== hash) {
    return res.json({
      success: false,
      error: 'Nieprawidłowa nazwa użytkownika lub hasło.',
    });
  }

  loggedInUserId = user.id;

  res.json({ success: true });
});

function hasAccount() {
  try {
    const db = openSystemDB();
    const user = db.prepare('SELECT id FROM users LIMIT 1').get();

    return !!user;
  } catch {
    return false;
  }
}

function isLoggedIn() {
  return loggedInUserId !== null;
}

function setLoggedIn(userId) {
  loggedInUserId = userId;
}

function setLoggedOut() {
  loggedInUserId = null;
}

module.exports = router;
