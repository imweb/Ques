var map = require('map-stream')
  , path = require('path')
  , fs = require('fs')
  , TagSet = require('../utils/tagSet')
  , _ = require('../utils/components')
  , Tag = require('./tag');

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
        , cDeps
        , tag;
      // if is component
      if (componentName) {
        componentHtml = _.getComPath(componentName, 'main.html');
        // create a Tag to get dependences
        tag = new Tag(fs.readFileSync(componentHtml, 'utf-8'), componentName);
        cDeps = tag.dependences;
        // destroy tag
        tag.destroy();
        tag = null;

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
        "define('" + file.path.match(/([^\\\/]+)\.js$/)[1] + "', " + _.makeDeps(deps.values()) + ", function (require, module, exports) {",
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
