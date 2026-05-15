const fs = require('fs');

async function downloadFile(url, dest, onProgress) {
  const { default: fetch } = await import('node-fetch');

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'blueberry/1.0',
    },
  });

  if (!res.ok) {
    throw new Error(`Download failed: HTTP ${res.status}`);
  }

  const total = parseInt(res.headers.get('content-length') ?? '0', 10);

  let received = 0;

  const out = fs.createWriteStream(dest);

  return new Promise((resolve, reject) => {
    res.body.on('data', (chunk) => {
      received += chunk.length;
      out.write(chunk);

      if (total > 0) {
        onProgress(Math.round((received / total) * 100));
      }
    });

    res.body.on('end', () => {
      out.end();
      resolve();
    });

    res.body.on('error', reject);
  });
}

module.exports = {
  downloadFile,
};
