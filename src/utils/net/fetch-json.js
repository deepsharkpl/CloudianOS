const fetchJson = async (url) => {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'blueberry/1.0',
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching ${url}`);
  }

  return res.json();
};

module.exports = { fetchJson };