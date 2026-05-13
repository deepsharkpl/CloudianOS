const colors = require('../colors');

function color(text, clr) {
  return colors[clr] ? colors[clr](text) : text;
}

module.exports = color;
