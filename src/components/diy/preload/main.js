function formatObject(decl) {
    if (decl.type !== 'ObjectExpression') return;
    var data = {},
        properties = decl.properties;
    properties.forEach(function (prop) {
        data[prop.key.name] = (prop.value.type && prop.value.type === 'ObjectExpression') ?
            formatObject(prop.value) : prop.value.value;
    });
    return data;
}

function formatUrl(url, data, params) {
    params = params || [];

    typeof data === 'object' && Object.keys(data).forEach(function (key) {
        params.push(key + '=' + data[key]);
    });

    return url + '?' + params.join('&');
}

function isQuery(obj) {
    var flag = false;
    Object.keys(obj).forEach(function (key) {
        !obj[key].indexOf('$') && (flag = true);
    });
    return flag;
}

module.exports = function (opts) {
    var fs = require('fs'),
        path = require('path'),
        esprima = require('esprima'),
        esquery = require('esquery');
    var self = this,
        $ = opts.$,
        container = opts.container,
        mainScript = this.mainScript,
        mainPath = mainScript.attr('src');

    // CGI need to preload
    var needPreload = [];

    function findPreload(file) {
        var DBRef,
            ast = esprima.parse(fs.readFileSync(file, 'utf-8')),
            matches = esquery(ast, '[type="VariableDeclaration"]')

        // find DB reference
        // for example
        // var db = require('db');
        // so 'db' is the DB reference
        matches.forEach(function (decl) {
            var _matches = esquery(decl, '[type="CallExpression"]');
            _matches.forEach(function (_decl) {
                var callee = _decl.callee;
                if (
                    callee &&
                        callee.name === 'require' &&
                        _decl.arguments[0].value === 'db'
                ) {
                    DBRef = decl.declarations[0].id.name;
                }
            });
        });

        if (DBRef) {
            matches = esquery(ast, '[type="ObjectExpression"]');
            matches.forEach(function (decl) {
                var _matches = esquery(decl, '[key.name="preload"]');
                if (_matches.length) {
                    var data = formatObject(decl);
                    if (data.preload && data.url) needPreload.push(data);
                }
            });
        } else {
            self.logError('you should require db in ' + mainPath + ' first');
        }
    }

    // if page's controller is exist
    if (mainPath) {
        mainPath = mainPath.replace(/[^\/]+$/, '');
        // this is the page's controller file dirname
        mainPath = path.join(process.cwd(), opts.config().src, mainPath);
        // find db.*.js
        fs.readdirSync(mainPath).forEach(function (filename) {
            if (/db\.([^\.]+\.js)/.test(filename)) {
                // find the which CGI need preload
                findPreload(path.join(mainPath, filename))
            }
        });
        // if need preload
        if (needPreload.length) {
            var script = [
                'var __PRELOAD__ = {',
                    'makeCb: function (cgi) {',
                        'return function (data) {',
                            "if (typeof __PRELOAD__[cgi] === 'function') {",
                                '__PRELOAD__[cgi](data);',
                            '}',
                            '__PRELOAD__[cgi] = data;',
                        '};',
                    '}',
                '};'
            ];
            var tags = [],
                docWrites = [],
                result,
                // use query or not
                useQuery = false;
            needPreload.forEach(function (preload, i) {
                if (preload.type.toLowerCase() === 'jsonp') {
                    script.push(
                        "var __PRELOAD__CB__" + i + " = __PRELOAD__.makeCb('" + preload.url + "');"
                    );
                    if (isQuery(preload.preload)) {
                        if (!useQuery) {
                            script.push([
                                '__PRELOAD__.query = function (key) {',
                                    'var r = new RegExp("[\\\&|\\\?|\\\#]" + key + "\\\\=([\\\\\\w|\\\\\\\\]+?)(\\\$|\\\\\&)");',
                                    'try {',
                                        'return location.href.match(r)[1];',
                                    '} catch(e) {',
                                        'return "";',
                                    '}',
                                '}',
                            ].join('\n'));
                        }
                        preload.callback = '__PRELOAD__CB__' + i;
                        docWrites.push(preload);
                    } else {
                        tags.push(formatUrl(preload.url, preload.preload, ['callback=__PRELOAD__CB__' + i]));
                    }
                }
            });

            result = [
                '<script>',
                script.join('\n'),
                '</script>'
            ];

            if (tags.length) {
                tags.forEach(function (tag) {
                    result.push('<script src="' + tag + '" async></script>');
                });
            }

            if (docWrites.length) {
                var tmp = ['<script>'];
                docWrites.forEach(function (preload) {
                    tmp.push([
                        'document.write((\'<script async src="' + formatUrl(preload.url, preload.preload, ['callback=' + preload.callback]) + '"></scr\' + \'ipt>\').replace(/\\\$\\\{(\.+?)\\\}/g, function (all, str) { return __PRELOAD__.query(str);}));'
                    ].join('\n'));
                });

                tmp.push('</script>');
                result.push.apply(result, tmp);
                tmp = null;
            }

            container.replaceWith(result.join('\n'));
        } else {
            container.remove();
        }
    }
};
