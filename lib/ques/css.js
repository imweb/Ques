var map = require('map-stream')
  , _ = require('../utils/components');

function css() {
  return map(function (file, fn) {
    var css = file.contents.toString();
    file.contents = new Buffer(_.fix(css, file.path));
    fn(null, file);
  });
}

module.exports = css;
