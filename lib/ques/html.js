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
};
p.logError = function (error) {
  error = error.replace(/\\/g, '\\\\')
                .replace(/\//g, '\/\/');

  var $ = this.$;
  $('head').append([
    '<style>',
    'html::before {',
      'display: block;',
      'white-space: pre-wrap;',
      'position: fixed;',
      'top: 0;',
      'left: 0;',
      'right: 0;',
      'z-index: 10000;',
      'font-size: .9em;',
      'padding: 1.5em 1em 1.5em 4.5em;',
      'color: #318edf;',
      'background-color: #fff;',
      'background: url(',
        '"data:image/svg+xml;charset=utf-8,%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20x%3D%220px%22%20y%3D%220px%22%0A%20%20width%3D%22512px%22%20height%3D%22512px%22%20viewBox%3D%220%200%20512%20512%22%20enable-background%3D%22new%200%200%20512%20512%22%20xml%3Aspace%3D%22preserve%22%3E%0A%20%20%0A%3ClinearGradient%20id%3D%22SVGID_1_%22%20gradientUnits%3D%22userSpaceOnUse%22%20x1%3D%22125.7515%22%20y1%3D%22307.4834%22%20x2%3D%22125.7514%22%20y2%3D%22-73.4854%22%20gradientTransform%3D%22matrix(1%200%200%20-1%20-50%20373)%22%3E%0A%20%20%3Cstop%20%20offset%3D%220%22%20style%3D%22stop-color%3A%23428BCA%22%2F%3E%0A%20%20%3Cstop%20%20offset%3D%220.325%22%20style%3D%22stop-color%3A%23507DBF%22%2F%3E%0A%20%20%3Cstop%20%20offset%3D%221%22%20style%3D%22stop-color%3A%235C71B6%22%2F%3E%0A%3C%2FlinearGradient%3E%0A%20%20%3Cpath%0A%20%20%20%20fill%3D%22url(%23SVGID_1_)%22%0A%20%20%20%20d%3D%22M256.002%2C50C142.23%2C50%2C50%2C142.229%2C50%2C256.001C50%2C369.771%2C142.23%2C462%2C256.002%2C462C369.771%2C462%2C462%2C369.771%2C462%2C256.001C462%2C142.229%2C369.771%2C50%2C256.002%2C50z%20M256.46%2C398.518c-16.207%2C0-29.345-13.139-29.345-29.346c0-16.205%2C13.138-29.342%2C29.345-29.342c16.205%2C0%2C29.342%2C13.137%2C29.342%2C29.342C285.802%2C385.379%2C272.665%2C398.518%2C256.46%2C398.518zM295.233%2C158.239c-2.481%2C19.78-20.7%2C116.08-26.723%2C147.724c-1.113%2C5.852-6.229%2C10.1-12.187%2C10.1h-0.239c-6.169%2C0-11.438-4.379-12.588-10.438c-6.1-32.121-24.293-128.504-26.735-147.971c-2.94-23.441%2C15.354-44.171%2C38.977-44.171C279.674%2C113.483%2C298.213%2C134.488%2C295.233%2C158.239z%22%0A%20%20%2F%3E%0A%3C%2Fsvg%3E"',
      ') 1em 1em / 2.5em 2.5em no-repeat, #fff;',
      'border-bottom: 4px solid #318edf;',
      'box-shadow: 0 0 .6em rgba(0,0,0, .25);',
      'font-family: Menlo, Monaco, monospace;',
      'content: "\203' + error + '";',
    '}',
    '</style>'
  ].join('\n'));
};
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
          self.logError(e.message + ' in ' + mod + '.js');
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

  $('link[rel=stylesheet]').last().after('<script>_T.push(+new Date);</script>');
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
