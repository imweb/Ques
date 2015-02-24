var map = require('map-stream')
  , path = require('path')
  , fs = require('fs')
  , TagSet = require('../utils/tagSet')
  , _ = require('../utils/components')
  , comDeps = require('./comDeps');

function js(needName, isComponent) {
  return map(function (file, fn) {
    var js = file.contents.toString()
      // init dependences
      , deps = new TagSet(['require', 'module', 'exports']);

    // check if it need to build
    if (/[^\.]\bdefine\b/.test(js)) return fn(null, file);

    // if this js is a component, it need to check dependences
    if (isComponent) {
      var componentName = file.path.match(/(\w+)(\W+)main\.js$/)
        , cDeps;
      if (componentName && comDeps.has(componentName[1])) {
        cDeps = comDeps(componentName[1]).values();
        cDeps.forEach(function (name) {
          js = [
            "Q.define('{{name}}', require('../{{name}}/main'));".replace(/\{\{name\}\}/g, name),
            js
          ].join('\n')
        });
        cDeps.length && (js = [
          "var Q = require('Q');",
          js
        ].join('\n'));
      }
    }

    js.replace(/require\((['"])(.+?)\1/g, function (all, quz, mod) {
      deps.add(mod);
    });

    js = needName ?
      [
        "define('" + file.path.match(/(\w+)\.js$/)[1] + "', " + _.makeDeps(deps.values()) + ", function (require, module, exports) {",
        js,
        '});'
      ].join('\n') :
      [
        "define(" + _.makeDeps(deps.values()) + ", function (require, module, exports) {",
        js,
        '});'
      ].join('\n');

    file.contents = new Buffer(_.fix(js, file.path));
    fn(null, file);
  });
}

module.exports = js;
