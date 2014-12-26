var map = require('map-stream')
  , path = require('path')
  , fs = require('fs')
  , cheerio = require('cheerio')
  , walker = require('./lib/walker')
  , Tag = require('./lib/tag')
  , cwd = process.cwd();

function _makeDeps(deps) {
  var i = 0 , l = deps.length;
  for (; i < l; i++) {
    deps[i] = "'" + deps[i] + "'";
  }
  return "[" + deps.join(', ') + "]"
}

function _2DepJs(customTag) {
  return _2Dep(customTag, 'main.js');
}

function _2Dep(customTag, file) {
  return './components/' + customTag + '/' + file;
}

function _fix(string, path) {
  var mod =  path.match(/components[\/\\](\w+?)[\/\\$]/);
  mod = (mod && mod[1]) || (path);
  return string.replace(/\$\_\_/g, mod + '__');
}

function html() {
  return map(function (file, fn) {
    var html = file.contents.toString()
      , $ = cheerio.load(html)
      , tag = new Tag()
      , customTags = []
      , uid = 0;

    $('body').append([
      '<script src="http://7.url.cn/edu/jslib/requirejs/2.1.6/require.min.js"></script>',
      '<script>',
      "require.config({ paths: { 'jquery': 'http://1.url.cn/jslib/jquery/1.9.1/jquery.min' }});"
    ].join('\n'));

    // find all targets in body
    walker.tag($('body')[0], function (node) {
      tag.push(node.name);
    });
    // find all custom targets
    tag.custom().forEach(function (customTag) {
      var componentPath = path.join(cwd, 'components', customTag);
      if (fs.existsSync(componentPath)) {
        customTags.push(customTag);
        var fragment = $(_fix(
          fs.readFileSync(
            path.join(componentPath, 'main.html'),
            'utf-8'
          ),
          customTag
        )).addClass('component-' + ++uid)
          , $customTag = $(customTag);
        if ($customTag.length > 1) {
          $customTag.each(function (i, ele) {
            $(ele).replaceWith(fragment.clone());
          });
        } else {
          $customTag.replaceWith(fragment);
        }
      }

      $('head').append('<link rel="stylesheet" href="' + _2Dep(customTag, 'main.css') + '"/>')
    });

    $('body').append([
      '<script>',
      "require(" + _makeDeps(customTags.map(_2DepJs)) + ", function () {",
        'for (var i = 0, l = arguments.length; i < l; i++) {',
          "arguments[i].init && arguments[i].init('.component-' + (i + 1))",
        '}',
      "});",
      '</script>'
    ].join('\n'));

    file.contents = new Buffer($.html());
    fn(null, file);
  });
}

function js() {
  return map(function (file, fn) {
    var js = file.contents.toString()
      , deps = ['require', 'module', 'exports'];

    js.replace(/require\((['"])(\w+?)\1/g, function (all, quz, mod) {
      deps.push(mod);
    });

    js = [
      "define(" + _makeDeps(deps) + ", function (require, module, exports) {",
      js,
      '});'
    ].join('\n');

    file.contents = new Buffer(_fix(js, file.path));
    fn(null, file);
  });
}

function css() {
  return map(function (file, fn) {
    var css = file.contents.toString();
    file.contents = new Buffer(_fix(css, file.path));
    fn(null, file);
  });
}

module.exports = {
  html: html,
  js: js,
  css: css
};
