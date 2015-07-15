var map = require('map-stream')
  , path = require('path')
  , fs = require('fs')
  , cheerio = require('cheerio')
  , walker = require('../utils/walker')
  , TagSet = require('../utils/tagSet')
  , Tag = require('./tag')
  , _ = require('../utils/components')
  , config = require('../utils/config');

/**
 * Page
 * @class
 * @param {String} str
 * @param {String} path
 */
function Page(str, path) {
  this._init(str);
}
var p = Page.prototype;
p._init = function (str, path) {
  this.$ = cheerio.load(str);
  // this page's custom targets
  this.customTags = new TagSet();
  // this page's ui targets
  this.uiTags = new TagSet();
  // this page's css
  this.cssSet = new TagSet();
  // uid for component
  this.uid = 0;
  // main script
  this.mainScript = this.$('script', 'body');
  // param for this page
  this.param = config(path);
  // append loader config
  this.appendLoader();
  // build all custom elements
  this.buildTag();
  // set all speed point
  this.setPoint();
};
p.appendLoader = function () {
  var param = this.param;

  this.$('body').append([
    '<script src="' + param.loader + '"></script>',
    '<script config="true">',
    "require.config({ paths: " + JSON.stringify(param.paths) + ", shim: " + JSON.stringify(param.shim) + "});",
    '</script>'
  ].join('\n'));
};
p.appendCSS = function (tag) {
  // css path for a tag
  var cssPath = _.getDepCSS(tag)
    , cssSet = this.cssSet
    , $ = this.$;
  if (!cssSet.has(cssPath)) {
    $('head').append('<link rel="stylesheet" href="' + cssPath + '"/>');
    cssSet.add(cssPath);
  }
}
p.buildTag = function () {
  var self = this
    , $ = this.$
    , tags = new TagSet()
    , param = this.param
    , customTags = this.customTags
    , uiTags = this.uiTags
    , cssSet = this.cssSet
    , mod;
  // find all targets in body
  walker.tags($('body'), function (node) {
    tags.add(node.name);
  });

  // find all custom targets
  tags.custom().forEach(function (customTag) {
    // feature flag
    // remove all disabled custom element
    if (param.disabled[customTag]) return $(customTag).remove();

    var componentPath = _.getComPath(customTag)
      , cssPath;
    // if the component exist
    if (fs.existsSync(componentPath)) {
      // diy target
      if (/^diy-/.test(customTag)) {
        mod = _.getComPath(customTag, 'main');
        // clear module cache
        delete require.cache[mod + '.js'];
        // just do it yourself
        try {
          require(mod).call(self, {
            tagName: customTag,
            $: $,
            container: $(customTag),
            config: require('../utils/config')
          });
        } catch(e) {
          console.error(e);
        }
      // ui target
      } else if (/^ui-/.test(customTag)) {
        uiTags.add(customTag);
        self.appendCSS(customTag);

        var fragmentTpl = (new Tag(fs.readFileSync(path.join(componentPath, 'main.html'), 'utf-8'), customTag, { ret: 'function' })).tpl
          , $customTag = $(customTag);

        $customTag.each(function (i, ele) {
          ele = $(ele);
          ele.replaceWith(_.makeFragment($, ele, fragmentTpl))
        });
      } else {
        customTags.add(customTag);
        self.appendCSS(customTag);
        ++self.uid;
        // build fragment template
        var tag = new Tag(fs.readFileSync(path.join(componentPath, 'main.html'), 'utf-8'), customTag, { ret: 'function' })
          , fragmentTpl = tag.tpl
          , $customTag = $(customTag);

        tag.dependences.values()
          .forEach(function (dep) {
            self.appendCSS(dep);
          });

        // destroy tag
        tag.destroy();
        tag = null;

        // replace all custom targets
        $customTag.each(function (i, ele) {
          ele = $(ele);
          ele.replaceWith(_.makeFragment($, ele, fragmentTpl, self.uid));
        });
      }
    }
  });

  var deps = customTags.values().map(_.getDepJS)
    , mainScript = this.mainScript;
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
      self.mainSrc = mainSrc;
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
};
p.setPoint = function () {
  var $ = this.$;
  // set the first start point
  $('link[rel=stylesheet]').first().before('<script>var _T = [+new Date];</script>');
  // dom end
  $('body script').first().before('<script>_T.push(+new Date);</script>');
  // script end
  $('body script').last().after('<script>_T.push(+new Date);</script>');
};
p.html = function () {
  var html = this.$.html();
  this.destroy();
  return html;
};
p.destroy = function () {
  this.str =
  this.$ =
  this.customTags =
  this.cssSet =
  this.mainScript =
  this.param =
    null;
};

/**
 * html
 * @returns {Stream}
 */
function html() {
  return map(function (file, fn) {
    var html = file.contents.toString()
      , page = new Page(html, file.path);

    file.contents = new Buffer(page.html());
    page = null;
    fn(null, file);
  });
}

module.exports = html;
