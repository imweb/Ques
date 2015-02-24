var map = require('map-stream')
  , path = require('path')
  , fs = require('fs')
  , TagSet = require('../utils/tagSet')
  , _ = require('../utils/components')
  , tpl = require('./tpl');

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
        , componentHtml = file.path.replace(/main\.js$/, 'main.html')
        , cDeps;
      if (componentName) {
        componentName = componentName[1];
        cDeps = new TagSet();
        tpl.build(
          fs.readFileSync(componentHtml, 'utf-8'),
          componentName,
          {
            onexists: function (tag) {
              cDeps.add(tag);
            }
          }
        );

        cDeps.values().forEach(function (name) {
          js = [
            "Q.define('{{name}}', require('../{{name}}/main'));".replace(/\{\{name\}\}/g, name),
            js
          ].join('\n')
        });
        cDeps.size() && (js = [
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
