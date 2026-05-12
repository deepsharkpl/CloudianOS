const fs = require("fs");
const path = require("path");
const { getSystemLanguage } = require("./getSystemLanguage");

const localesPath = path.resolve(__dirname, "../locales");
const cache = {};

function loadLocale(lang) {
  const safeLang = (lang || "en").split("-")[0];
  const filePath = path.join(localesPath, safeLang, "translation.json");

  if (cache[safeLang]) return cache[safeLang];

  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);

    cache[safeLang] = parsed;
    return parsed;
  } catch (err) {
    if (safeLang !== "en") {
      return loadLocale("en");
    }

    return {};
  }
}

function t(key, lang) {
  const locale = lang || getSystemLanguage();
  const translations = loadLocale(locale);

  return translations[key] || key;
}

function i18nMiddleware(req, res, next) {
  const lang =
    req.headers["accept-language"]?.split(",")[0] || getSystemLanguage();

  const translations = loadLocale(lang);

  req.lang = lang;
  req.t = (key) => translations[key] || key;
  res.locals.t = translations;
  res.locals.lang = lang;

  next();
}

module.exports = {
  t,
  loadLocale,
  i18nMiddleware,
};
