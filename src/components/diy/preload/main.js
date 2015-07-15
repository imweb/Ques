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
            // find DB.httpMethod
            matches = esquery(ast, '[type="CallExpression"][callee.object.name="' + DBRef + '"][callee.property.name="httpMethod"]');

            matches.forEach(function (decl) {
                var data = {},
                    properties = decl.arguments[0].properties;
                properties.forEach(function (prop) {
                    data[prop.key.name] = prop.value.value;
                });
                // if need preload
                if (data.preload) needPreload.push(data);
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
            var tags = [], result;
            needPreload.forEach(function (preload, i) {
                if (preload.type.toLowerCase() === 'jsonp') {
                    script.push(
                        "var __PRELOAD__CB__" + i + " = __PRELOAD__.makeCb('" + preload.url + "');"
                    );
                    tags.push(preload.url + '?callback=__PRELOAD__CB__' + i);
                }
            });

            result = [
                '<script>',
                script.join('\n'),
                '</script>'
            ];

            if (tags) {
                tags.forEach(function (tag) {
                    result.push('<script src="' + tag + '" async></script>');
                });
            }

            container.replaceWith(result.join('\n'));
        } else {
            container.remove();
        }
    }
};
