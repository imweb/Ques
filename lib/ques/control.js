var map = require('map-stream');

/**
 * control
 * @returns {Stream}
 */
function control() {
  return map(function (file, fn) {
    var string = file.contents.toString()
      , name = file.query.match(/\?([\w\-]+)/)[1];

    file.contents = new Buffer(string.replace(/\{\{\placeholder}\}/, '<' + name + '></' + name + '>'));
    fn(null, file);
  });
}

module.exports = control;

