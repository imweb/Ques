var map = require('map-stream')
  , path = require('path')
  , fs = require('fs')
  , cheerio = require('cheerio')
  , walker = require('./lib/walker')
  , Tag = require('./lib/tag')
  , tpl = require('dom.tpl/Qtpl')
  , config = require('../config')
  , disabled = config.disabled
  , src = path.resolve(config.src)
  , filters = require('../src/lib/cjs/filters')
  , _filters = {}
  , _turnback = function (s) { return s; };

Object.keys(filters).forEach(function (key) {
  _filters[key] = filters[key].read || filters[key] || _turnback;
});

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
  var attrs = $ele.attr()
    , res = $(tpl(attrs, { filters: _filters })).addClass('component-' + uid);
  if (attrs.id) res.attr('id', attrs.id);
  if (attrs.class) res.addClass(attrs.class);
  return res;
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
      '<script src="' + config.loader + '"></script>',
      '<script config="true">',
      "require.config({ paths: " + JSON.stringify(config.paths) + "});",
      '</script>'
    ].join('\n'));

    // find all targets in body
    walker.tag($('body')[0], function (node) {
      tag.push(node.name);
    });
    // find all custom targets
    tag.custom().forEach(function (customTag) {
      // feature flag
      if (disabled[customTag]) return $(customTag).remove();

      var componentPath = path.join(src, 'components', customTag);
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
      var mainSrc, index;
      mainScript.each(function (i, el) {
        if (mainSrc = $(el).attr('src')) {
          index = i;
          return false;
        }
      });
      if (mainSrc) {
        deps.push(mainSrc);
        $(mainScript[index]).remove();
        mainScript = undefined;
      } else {
        $(mainScript[0]).remove();
        mainScript = mainScript.text();
      }
    }

    $('body').append([
      '<script main="true">',
      "require(" + _makeDeps(deps) + ", function () {",
        'for (var i = 0, l = arguments.length; i < l; i++) {',
          "arguments[i].init && arguments[i].init('.component-' + (i + 1));",
        '}',
        mainScript,
      "});",
      '</script>'
    ].join('\n'));

    file.contents = new Buffer($.html());
    fn(null, file);
  });
}

function js(needName) {
  return map(function (file, fn) {
    var js = file.contents.toString()
      , deps = ['require', 'module', 'exports'];

    js.replace(/require\((['"])(.+?)\1/g, function (all, quz, mod) {
      deps.push(mod);
    });

    js = needName ?
      [
        "define('" + file.path.match(/(\w+)\.js$/)[1] + "', " + _makeDeps(deps) + ", function (require, module, exports) {",
        js,
        '});'
      ].join('\n') :
      [
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
