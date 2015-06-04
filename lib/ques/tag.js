var map = require('map-stream')
  , path = require('path')
  , fs = require('fs')
  , cheerio = require('cheerio')
  , tpl = require('dom.tpl/Qtpl')
  , TagSet = require('../utils/tagSet')
  , _ = require('../utils/components');

function Tag(string, name) {
  this._init(string, name);
}
var p = Tag.prototype;
p._init = function (string, name) {
  var self = this;
  this.dependences = new TagSet();
  this.tpl = tpl(
    _.fix(string, name),
    {
      ret: 'function',
      oncustomElement: function (ele) {
        // this child custom element name
        var childCustomTag = ele.name
          , componentPath = _.getComPath(childCustomTag)
          // dependences
          , dependences = self.dependences
          , attribs
          , key;
        // if has this child custom component
        if (fs.existsSync(componentPath)) {
          dependences.add(childCustomTag);
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
  );
};
p.destroy = function () {
  this.dependences = null;
  this.tpl = null;
}

module.exports = Tag;
