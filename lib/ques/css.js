var map = require('map-stream')
  , postcss = require('postcss')
  , cssnext = require('cssnext')
  , cssgrace = require('cssgrace')
  , _ = require('../utils/components')
  // get the DEFAULT config
  , config = require('../utils/config')();

function css() {
  var contenter = postcss()
    .use(cssnext(config.cssnext))
    // waiting cssgrace fixed issue#26
    //.use(cssgrace.postcss);

  return map(function (file, fn) {
    var css = file.contents.toString();
    file.contents = new Buffer(
      contenter.process(
        _.fix(css, file.path),
        { from: file.path }
      ).css
    );
    fn(null, file);
  });
}

module.exports = css;
