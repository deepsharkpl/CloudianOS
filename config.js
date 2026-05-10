const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, "package.json"), "utf8"),
);

function getNpmVersion() {
  try {
    return execSync("npm -v").toString().trim();
  } catch (err) {
    return "unknown";
  }
}

const config = {
  version: packageJson.version,
  nodeVersion: process.version,
  npmVersion: getNpmVersion(),
};

module.exports = config;
