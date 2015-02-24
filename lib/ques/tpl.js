var map = require('map-stream')
  , path = require('path')
  , fs = require('fs')
  , cheerio = require('cheerio')
  , tpl = require('dom.tpl/Qtpl')
  , TagSet = require('../utils/tagSet')
  , _ = require('../utils/components');

function build(string, name, options) {
  options = options || {};
  return tpl(
    _.fix(string, name),
    {
      ret: options.ret,
      oncustomElement: function (ele) {
        // this child custom element name
        var childCustomTag = ele.name
          , componentPath = _.getComPath(childCustomTag)
          , attribs
          , key;
        // if has this child custom component
        if (fs.existsSync(componentPath)) {
          // when child custom element exists
          options.onexists &&
            options.onexists(childCustomTag);
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
  )
}

function _tpl() {
  return map(function (file, fn) {
    var string = file.contents.toString()
      , childTags = new TagSet()
      , css = []
      , res = [build(string, file.path, {
        onexists: function (tag) {
          childTags.add(tag) &&
            css.push(
              _.fix(
                fs.readFileSync(file.path.replace(/(\w+)\/main\.html$/, tag + '/main\.css'), 'utf-8'),
                tag
              ).replace(/\n/g, '\\n')
               .replace(/'/g, "\\'")
            );
        }
      })];

    res.unshift(
      'define(function () {',
      'var res = '
    );

    res.push(
      css.length ? "res.css = '" + css.join('\\n') + "';" : undefined,
      'return res;',
      '});'
    );

    file.contents = new Buffer(res.join('\n'));
    fn(null, file);
  });
}

_tpl.build = build;

module.exports = _tpl;

