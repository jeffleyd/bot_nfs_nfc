const parse = require('node-html-parser');

function dom(source) {
  return parse.parse(source);
}

exports.dom = dom;