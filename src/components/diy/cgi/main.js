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
        mainPath = mainScript.attr('src'),
        cwd = process.cwd();

    // need server render
    var needServerRender = [];

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
                var _matches = esquery(decl, '[key.name="cgi"]');
                if (_matches.length) {
                    var data = formatObject(decl);
                    if (data.cgi) needServerRender.push(data);
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
        if (needServerRender.length) {
            var result = ['var __CGI__ = {'];

            needServerRender.forEach(function (data) {
                data = data.cgi.split('=>');
                var mod = path.join(cwd, 'cgi', data[0].trim());
                delete require.cache[mod + '.js'];
                try {
                    require(mod)(function (d) {
                        result.push(data[0] + ': ' + JSON.stringify(d, '', 4), ',');
                    });
                } catch(e) {
                    console.error(e);
                }
            });

            result.pop();
            result.push('};');
            container.replaceWith('<script>' + result.join('\n') + '</script>');
        } else {
            container.remove();
        }
    }
};
