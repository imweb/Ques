var htmlparser = require('htmlparser2')
  , stringify = require('dom-serializer')
  , walker = require('./walker')
  , mtpl = require('micro-tpl')
  , MARK = /\{\{(.+?)\}\}/;

function _makeMark(mark) {
  return "<i class='q-mark'>{{" + mark + "}}</i>"
}

function _markValue(key) {
  var res = 'it.' + key;
  if (arguments.length === 1) return res;
  var filters = [].slice.call(arguments, 1);
  filters.forEach(function (filter) {
    var params = filter.split(' ');
    "a", "b", "b"
    filter = params.shift();
    res = [
      'opt.filters["' + filter + '"](',
      res,
      params.length ? (', "' + params.join('", "') + '"') : undefined,
      ')'
    ].join('');
  });
  console.log(res);
  return res;
}

function tpl(str) {
  var dom = htmlparser.parseDOM(str);
  walker.text(dom[0], function (node) {
    var match = node.data.match(MARK)
      , params;
    if (match) {
      params = match[1].trim().split(/\s*\|\s*/);
      node.data = node.data.replace(MARK, '<%=' + _markValue.apply(this, params) + ' + "' + _makeMark(match[1]) + '"%>');
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
