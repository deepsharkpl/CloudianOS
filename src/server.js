require('dotenv').config({
  quiet: true,
});

const express = require('express');
const path = require('path');
const config = require('../config');

const os = require('os');

const { i18nMiddleware } = require('./i18n/i18n');
const chalk = require('chalk');

const centerBoxText = require('./utils/text/centerBoxText');
const line =
  '╔═════════════════════════════════════════════════════════════════╗';
const separator =
  '║─────────────────────────────────────────────────────────────────║';
const width = line.length;

const app = express();
const PORT = process.env.HTTP_PORT || 3000;

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'UI'));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(i18nMiddleware);

app.use('/styles', express.static(path.join(__dirname, 'styles', 'css')));
app.use('/img', express.static(path.join(__dirname, 'styles', 'img')));
app.use('/js', express.static(path.join(__dirname, 'styles', 'js')));

app.get('/', (req, res) => {
  res.render('welcome_screen');
});

app.get('/test', (req, res) => {
  res.render('desktop');
});

app.use('/api/configuration', require('./routes/api.configuration'));
app.use('/api/system', require('./routes/api.system'));

function getLocalIP() {
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }

  return '127.0.0.1';
}

function startServer(port) {
  const localIP = getLocalIP();
  app
    .listen(port, () => {
      console.log(
        '╔═════════════════════════════════════════════════════════════════╗',
      );
      console.log(centerBoxText(' ', width));
      (console.log(
        centerBoxText(
          chalk.green(
            `Blueberry OS v${config.version} has been successfully launched.`,
          ),
          width,
        ),
      ),
        console.log(centerBoxText(' ', width)));
      console.log(
        centerBoxText(
          `Blueberry is now live at · ` +
            chalk.underline.blue(`http://localhost:${port}`),
          width,
        ),
      );
      console.log(
        centerBoxText(
          `Network access · ` +
            chalk.underline.green(`http://${localIP}:${port}`),
          width,
        ),
      );
      console.log(centerBoxText(' ', width));
      console.log(separator);
      console.log(centerBoxText(' ', width));
      console.log(
        centerBoxText(
          chalk.gray('Blueberry OS is still under active development.'),
          width,
        ),
      );
      console.log(
        centerBoxText(
          chalk.gray('Some features or apps may contain bugs/issues.'),
          width,
        ),
      );
      console.log(
        centerBoxText(
          chalk.gray('Join devs & community: ') +
            chalk.underline.gray('https://discord.gg/kmEsF6PSkt'),
          width,
        ),
      );
      console.log(centerBoxText(' ', width));
      console.log(
        '╚═════════════════════════════════════════════════════════════════╝\n',
      );
    })
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(
          chalk.red(
            '[ ' +
              chalk.red('FAIL') +
              ` ]  Port ${port} is already in use. Trying next port...`,
          ),
        );

        startServer(port + 1);
      } else {
        console.error(err);
      }
    });
}

startServer(PORT);
