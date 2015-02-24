var map = require('map-stream')
  , path = require('path')
  , fs = require('fs')
  , cheerio = require('cheerio')
  , tpl = require('dom.tpl/Qtpl')
  , _ = require('../utils/components');

function _tpl() {
  return map(function (file, fn) {
    var string = file.contents.toString();
    file.contents = new Buffer([
      'define(function () {',
      'return ' + tpl(
        _.fix(string, file.path),
        {
          oncustomElement: function (ele) {
            var childCustomTag = ele.name
              , componentPath = _.getComPath(childCustomTag)
              , attribs
              , key;
            if (fs.existsSync(componentPath)) {
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
              for (key in ele.attribs) {
                key.indexOf('q-') === 0 &&
                  (attribs[key] = ele.attribs[key]);
              }
              return $$.html();
            } else {
              return ele;
            }
          }
        }) + ';',
      '});'
    ].join('\n'));
    fn(null, file);
  });
}

module.exports = _tpl;
