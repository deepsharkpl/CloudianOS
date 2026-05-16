'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');
const { loadAllApps, loadApp } = require('./gamingLoader');

const router = express.Router();

router.get('/', (req, res) => {
  const apps = loadAllApps().map((app) => ({
    slug: app.slug,
    name: app.name,
    icon: `/api/gaming/${app.slug}/icon`,
    setupFound: app.setupFound,
    setupPath: app.setupPath,
  }));
  res.json({ count: apps.length, apps });
});

router.get('/widget/gaming', (req, res) => {
  const apps = loadAllApps().map(a => ({
    slug:       a.slug,
    name:       a.name,
    icon:       `/api/gaming/${a.slug}/icon`,
    setupFound: a.setupFound,
    setupPath:  a.setupPath,
  }));
  res.render('includes/gaming_apps', { apps });
});


router.get('/:slug', (req, res) => {
  const app = loadApp(req.params.slug);
  if (!app)
    return res
      .status(404)
      .json({ error: `Aplikacja "${req.params.slug}" nie istnieje.` });

  res.json({
    slug: app.slug,
    name: app.name,
    icon: `/api/gaming/${app.slug}/icon`,
    setupFound: app.setupFound,
    setupPath: app.setupPath,
    appDir: app.appDir,
  });
});

router.get('/:slug/icon', (req, res) => {
  const app = loadApp(req.params.slug);
  if (!app || !app.iconPath) {
    return res.status(404).json({ error: 'Brak ikony.' });
  }

  const ext = path.extname(app.iconPath).toLowerCase();
  const mimeMap = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.gif': 'image/gif',
  };

  const mime = mimeMap[ext] ?? 'application/octet-stream';
  res.setHeader('Content-Type', mime);
  res.setHeader('Cache-Control', 'public, max-age=3600');
  fs.createReadStream(app.iconPath).pipe(res);
});

module.exports = router;
