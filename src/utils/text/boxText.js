function boxText(text, width) {
  const innerWidth = width - 2;

  return '║' + text + ' '.repeat(Math.max(0, innerWidth - text.length)) + '║';
}

module.exports = boxText;
