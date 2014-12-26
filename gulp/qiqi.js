var map = require('map-stream')
  , path = require('path')
  , fs = require('fs')
  , cheerio = require('cheerio')
  , walker = require('./lib/walker')
  , Tag = require('./lib/tag')
  , tpl = require('micro-tpl')
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

function _makeFragment($, $ele, tpl, uid) {
  return $(tpl($ele.attr())).addClass('component-' + uid)
}

function html() {
  return map(function (file, fn) {
    var html = file.contents.toString()
      , $ = cheerio.load(html)
      , tag = new Tag()
      , customTags = []
      , uid = 0
      , mainScript = $('script', 'body');

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
        ++uid;
        var fragmentTpl = tpl(
          _fix(
            fs.readFileSync(
              path.join(componentPath, 'main.html'),
              'utf-8'
            ),
            customTag
          ),
          { ret: 'function' }
        ),  $customTag = $(customTag);

        $customTag.each(function (i, ele) {
          ele = $(ele);
          ele.replaceWith(_makeFragment($, ele, fragmentTpl, uid));
        });
      }

      $('head').append('<link rel="stylesheet" href="' + _2Dep(customTag, 'main.css') + '"/>')
    });

    var deps = customTags.map(_2DepJs);
    // find the main script, max number is 1
    if (mainScript.length) {
      deps.push(mainScript.attr('src'));
      mainScript.remove();
    }

    $('body').append([
      '<script>',
      "require(" + _makeDeps(deps) + ", function () {",
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

    js.replace(/require\((['"])(.+?)\1/g, function (all, quz, mod) {
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

function _tpl() {
  return map(function (file, fn) {
    var string = file.contents.toString();
    file.contents = new Buffer([
      'define(function () {',
      'return ' + tpl(_fix(string, file.path)) + ';',
      '});'
    ].join('\n'));
    fn(null, file);
  });
}

module.exports = {
  html: html,
  js: js,
  css: css,
  tpl: _tpl
};
