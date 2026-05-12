const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

app.set("view engine", "pug");

app.set("views", path.join(__dirname, "UI"));

app.use("/styles", express.static(path.join(__dirname, "styles", "css")));
app.use("/img", express.static(path.join(__dirname, "styles", "img")));
app.use("/js", express.static(path.join(__dirname, "styles", "js")));

app.get("/", (req, res) => {
  res.render("welcome_screen");
});

app.listen(PORT, () => {
  console.log(`The server is running on http://localhost:${PORT}`);
});
