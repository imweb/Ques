var map = require('map-stream')
  , path = require('path')
  , fs = require('fs')
  , TagSet = require('../utils/tagSet')
  , _ = require('../utils/components')
  , src = require('../utils/config')().src
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
        , relativePath = path.relative(path.dirname(file.path), path.join(src, 'components')).replace(/\\/g, '\/')
        , componentHtml
        , cDeps
        , extend
        , tag;
      // if is component
      if (componentName) {
        componentHtml = _.getComPath(componentName, 'main.html');
        // create a Tag to get dependences
        tag = new Tag(fs.readFileSync(componentHtml, 'utf-8'), componentName, { justFind: true });
        cDeps = tag.dependences;
        extend = tag.extend;
        // destroy tag
        tag.destroy();
        tag = null;

        var childComponets = cDeps.values().filter(function (v) {
          return !/^ui-/.test(v) && !/^third-/.test(v);
        }), thirdComponets = cDeps.values().filter(function (v) {
          return /^third-/.test(v);
        });

        // set component
        childComponets.forEach(function (name) {
          var path = name.split('-').join('/');
          js = [
            "Q.define('{{name}}', require('" + relativePath + "/{{path}}/main'));".replace(/\{\{path\}\}/g, path)
                                                                .replace(/\{\{name\}\}/g, name),
            js
          ].join('\n');
        });

        // set third party component
        thirdComponets.forEach(function (name) {
          var path = name.split('-').join('/');
          js = [
            "Third.key('{{name}}', require('" + relativePath + "/{{path}}/main'));".replace(/\{\{path\}\}/g, path)
                                                                .replace(/\{\{name\}\}/g, name),
            js
          ].join('\n');
        });

        // require Q
        childComponets.length && (js = [
          "var Q = require('Q');",
          js
        ].join('\n'));

        // require third party cache
        thirdComponets.length && (js = [
          "var Third = require('third');",
          js
        ].join('\n'));

        // set the extend name in options
        extend && (js = [
          js,
          "Q.require('" + extend + "').define('" + componentName + "', module.exports);",
          "module.exports.__extend__ = '" + extend + "';",
          "module.exports.name = '" + componentName + "';"
        ].join('\n'));

      }
    }

    // make dependence
    js.replace(/[^\.]require\((['"])(.+?)\1/g, function (all, quz, mod) {
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
