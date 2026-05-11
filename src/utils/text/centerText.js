function centerText(text, width) {
  const padding = Math.max(0, Math.floor((width - text.length) / 2));

  return " ".repeat(padding) + text;
}

module.exports = centerText;
