const stripAnsi = require("strip-ansi").default;

function centerBoxText(text, width) {
  const visibleLength = stripAnsi(text).length;

  const innerWidth = width - 2;

  const totalPadding = innerWidth - visibleLength;

  const leftPadding = Math.floor(totalPadding / 2);

  const rightPadding = totalPadding - leftPadding;

  return (
    "║" +
    " ".repeat(Math.max(0, leftPadding)) +
    text +
    " ".repeat(Math.max(0, rightPadding)) +
    "║"
  );
}

module.exports = centerBoxText;
