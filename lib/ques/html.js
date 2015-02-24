var map = require('map-stream')
  , path = require('path')
  , fs = require('fs')
  , cheerio = require('cheerio')
  , walker = require('../utils/walker')
  , TagSet = require('../utils/tagSet')
  , _ = require('../utils/components')
  , tpl = require('dom.tpl/Qtpl')
  , config = require('../utils/config')
  , comDeps = require('./comDeps');

function html() {
  return map(function (file, fn) {
    var html = file.contents.toString()
      , $ = cheerio.load(html)
      , tag = new TagSet()
      // this page's custom targets
      , customTags = new TagSet()
      // this page's child custom targets
      , childCustomTags = new TagSet()
      // uid for component
      , uid = 0
      // main script
      , mainScript = $('script', 'body')
      // param for this page
      , param = config(file.path);

    // loader config
    $('body').append([
      '<script src="' + param.loader + '"></script>',
      '<script config="true">',
      "require.config({ paths: " + JSON.stringify(param.paths) + "});",
      '</script>'
    ].join('\n'));

    // find all targets in body
    walker.tags($('body'), function (node) {
      tag.add(node.name);
    });
    // find all custom targets
    tag.custom().forEach(function (customTag) {
      // feature flag
      if (param.disabled[customTag]) return $(customTag).remove();

      var componentPath = _.getComPath(customTag);
      // if the component exist
      if (fs.existsSync(componentPath)) {
        customTags.add(customTag) &&
          childCustomTags.has(customTag) ||
            $('head').append('<link rel="stylesheet" href="' + _.getDepCSS(customTag) + '"/>');
        ++uid;
        // reset component dependence
        comDeps.reset(customTag);
        // build fragment template
        var fragmentTpl = tpl(
          // fix context
          _.fix(
            fs.readFileSync(
              path.join(componentPath, 'main.html'),
              'utf-8'
            ),
            customTag
          ),
          {
            // return template function
            ret: 'function',
            // when find a custom element
            oncustomElement: function (ele) {
              // this child custom element name
              var childCustomTag = ele.name
                , componentPath = _.getComPath(childCustomTag)
                , attribs
                , key;
              // if has this child custom component
              if (fs.existsSync(componentPath)) {
                comDeps(customTag).add(childCustomTag);

                childCustomTags.add(childCustomTag) &&
                  customTags.has(childCustomTag) ||
                    $('head').append('<link rel="stylesheet" href="' + _.getDep(childCustomTag, 'main.css') + '"/>');
                // find custom element and replace it
                var $$ = cheerio.load(_.fix(
                  fs.readFileSync(
                    path.join(componentPath, 'main.html'),
                    'utf-8'
                  ),
                  childCustomTag
                ));
                attribs = $$._root.children[0].attribs;
                // set q-vm
                attribs['q-vm'] = childCustomTag;
                // extend q-* attributes
                for (key in ele.attribs) {
                  key.indexOf('q-') === 0 &&
                    (attribs[key] = ele.attribs[key]);
                }
                return $$.html();
              } else {
                return ele;
              }
            }
          }
        ),  $customTag = $(customTag);

        // replace all custom targets
        $customTag.each(function (i, ele) {
          ele = $(ele);
          ele.replaceWith(_.makeFragment($, ele, fragmentTpl, uid));
        });
      }
    });

    var deps = customTags.values().map(_.getDepJS);
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
    // should require factory
    deps.push('./components/factory');

    $('body').append([
      '<script main="true">',
      "require(" + _.makeDeps(deps) + ", function () {",
        "var i = 0, l = arguments.length, factory = arguments[l - 1];",
        'for (; i < ' + (mainScript ? 'l - 1': 'l - 2') + '; i++) {',
          "arguments[i].init ? arguments[i].init() : factory('.component-' + (i + 1), arguments[i]);",
        '}',
        mainScript ? mainScript : 'arguments[l - 2].init()',
      "});",
      '</script>'
    ].join('\n'));

    file.contents = new Buffer($.html());
    fn(null, file);
  });
}

module.exports = html;
