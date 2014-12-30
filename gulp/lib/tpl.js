var htmlparser = require('htmlparser2')
  , stringify = require('dom-serializer')
  , walker = require('./walker')
  , mtpl = require('micro-tpl')
  , MARK = /\{\{(.+?)\}\}/;

function _makeMark(mark) {
  return "<i class='q-mark'>{{" + mark + "}}</i>"
}

function tpl(str) {
  var dom = htmlparser.parseDOM(str);
  walker.text(dom[0], function (node) {
    var match = node.data.match(MARK);
    if (match) {
      node.data = node.data.replace(MARK, '<%=it.' + match[1] + ' + "' + _makeMark(match[1]) + '"%>');
    }
  });
  walker.tags(dom, function (node) {
    var id = node.attribs.id;
    if (id) {
      var match = id.match(MARK);
      if (match) {
        node.attribs.id = id.replace(MARK, '<%=it.' + match[1] + '%>');
      }
    }
  });
  return mtpl(stringify(dom), { ret: 'function' });
}

module.exports = tpl;
