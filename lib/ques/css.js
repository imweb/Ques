var map = require('map-stream')
  , postcss = require('postcss')
  , cssnext = require('cssnext')
  , cssgrace = require('cssgrace')
  , _ = require('../utils/components');

function css() {
  var contenter = postcss()
    .use(cssnext({ browsers: ['> 1%', 'IE 8'] }))
    .use(cssgrace.postcss);

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
