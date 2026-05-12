require("dotenv").config();
const express = require("express");
const path = require("path");

const { i18nMiddleware } = require("./i18n/i18n");

const { getTime24 } = require("./utils/system/getTime");
const { getCurrentDate } = require("./utils/system/getCurrentDate");

const app = express();
const PORT = process.env.HTTP_PORT || 3000;

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "UI"));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(i18nMiddleware);

app.use("/styles", express.static(path.join(__dirname, "styles", "css")));
app.use("/img", express.static(path.join(__dirname, "styles", "img")));
app.use("/js", express.static(path.join(__dirname, "styles", "js")));

app.get("/", (req, res) => {
  res.render("welcome_screen");
});

app.get("/test", (req, res) => {
  res.render("desktop");
});

app.get("/api/system/time", (req, res) => {
  res.json({
    time: getTime24(),
    date: getCurrentDate(),
  });
});

app.listen(PORT, () => {
  console.log(`The server is running on http://localhost:${PORT}`);
});
