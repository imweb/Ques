var EOL = '\n';

function walk(nodes, cb) {
    var atts, i, l, res;
    nodes.forEach(function (node) {
        atts = node.attributes;
        console.log(node);
        res = [];

        for (i = 0, l = atts.length; i < l; i++) {
            if (atts[i].name.indexOf('q') === 0) {
                res.push({
                    name: atts[i].name.slice(2),
                    value: atts[i].value
                });
            }
        }
        res.length > 0 &&
            cb(node, res);
    });
}

function build(tmpl) {
    var res = [];
    res.push([
        "    it = it || {};",
        "        var _$out_= [];",
        "        _$out_.push('" + tmpl
                .replace(/\r\n|\n|\r/g, "\v")
                .replace(/(?:^|%>).*?(?:<%|$)/g, function ($0) {
                    return $0.replace(/('|\\)/g, "\\$1").replace(/[\v\t]/g, "").replace(/\s+/g, " ");
                })
                .replace(/<!--[\s\S]+?-->/g, '')
                .replace(/[\v]/g, EOL)
                .replace(/<%==(.*?)%>/g, "', opt.encodeHtml($1), '")
                .replace(/<%=(.*?)%>/g, "', $1, '")
                .replace(/<%(<-)?/g, "');" + EOL + "      ")
                .replace(/->(\w+)%>/g, EOL + "      $1.push('")
                .split("%>").join(EOL + "      _$out_.push('") + "');",
        "        return _$out_.join('');"
  ].join(EOL).replace(/_\$out_\.push\(''\);/g, ''));
  return new Function('it', 'opt', res);
}

module.exports = {
    $set: function (key, value) {
        var obj = {};
        obj[key] = value;
        this.el.innerHTML = this.tpl(obj);
    },
    bind: function () {
        var el = this.el,
            eles = [].slice.call(el.children, 0),
            repeat,
            tpl;
        eles.forEach(function (item) {
            el.removeChild(item);
        });
        walk(eles, function (node, res) {
            res.forEach(function (item) {
                switch (item.name) {
                    case 'repeat':
                        // need for each property
                        repeat = item.value;
                        node.removeAttribute('q-repeat');
                        break;
                    case 'text':
                        node.textContent = '{{=item.' + item.value + '}}';
                        node.removeAttribute('q-text');
                        break;
                }
            });
        });
        tpl = [
            '<%',
                'var item;',
                'for (var i = 0, l = it.' + repeat + '.length; i < l; i++) {',
                'item = it.' + repeat + '[i];',
            '%>',
            eles[0].outerHTML.replace(/\{\{\=(.+?)\}\}/g, '<%=$1%>'),
            '<% } %>'
        ].join('\n');

        this.tpl = build(tpl);
        console.log(this.tpl.toString());
    },
    unbind: function () {}
};
