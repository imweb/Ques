var map = require('map-stream')
  , path = require('path')
  , fs = require('fs')
  , TagSet = require('../utils/tagSet')
  , _ = require('../utils/components')
  , tpl = require('./tpl');

/**
 * js
 * @param {Boolean} needName if js need its name
 * @param {Boolean} isComponent if it is a component script
 * @returns {Stream}
 */
function js(needName, isComponent) {
  return map(function (file, fn) {
    var js = file.contents.toString()
      // init dependences
      , deps = new TagSet(['require', 'module', 'exports']);

    // check if it need to build
    if (/\s\bdefine\b/.test(js)) return fn(null, file);

    // if this js is a component, it need to check dependences
    if (isComponent) {
      var componentName = _.getComName(file.path)
        , componentHtml
        , cDeps;
      // if is component
      if (componentName) {
        componentHtml = _.getComPath(componentName, 'main.html');
        // create a Set to collect child custom elements
        cDeps = new TagSet();

        // use tpl.build to find all child custom elements
        tpl.build(
          fs.readFileSync(componentHtml, 'utf-8'),
          componentName,
          {
            onexists: function (tag) {
              cDeps.add(tag);
            }
          }
        );

        // set component
        cDeps.values().forEach(function (name) {
          js = [
            "Q.define('{{name}}', require('../{{name}}/main'));".replace(/\{\{name\}\}/g, name),
            js
          ].join('\n')
        });
        // require Q
        cDeps.size() && (js = [
          "var Q = require('Q');",
          js
        ].join('\n'));
      }
    }

    // make dependence
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
