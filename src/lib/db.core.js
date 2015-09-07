/* jshint ignore:start */
var _noop = function () {},
    _extend = function (target, srcs) {
        if (arguments.length === 1) return _extend(this, target);
        srcs = [].splice.call(arguments, 1);
        var i = 0, l = srcs.length, src, key;
        for (; i < l; i++) {
            src = srcs[i];
            for (key in src) {
                target[key] = src[key];
            }
        }
        return target;
    },
    _encode = function (para) {
        var i, arr = [];
        for (i in para) {
            arr.push(i + '=' + para[i]);
        }
        return arr.join('&');
    },
    _ajax = function ajax(para) {
        var xhr = new XMLHttpRequest(),
            url = para.url,
            method = para.method || para.type,
            data = para.data,
            success = para.success || _noop,
            error = para.error || _noop;
        if (para.xhrFields && 'withCredentials' in para.xhrFields) {
            xhr.withCredentials = para.xhrFields.withCredentials;
        }
        if (method.toLocaleLowerCase() === 'get') {
            if (~url.indexOf('?')) {
                url += '&' + _encode(data);
            } else {
                url += '?' + _encode(data);
            }
        }
        xhr.open(method, url, true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304 || xhr.status === 1223 || xhr.status === 0) {
                    try {
                        if (para.dataType === 'JSON' && xhr.responseText) {
                            success(JSON.parse(xhr.responseText));
                        } else {
                            success(xhr.responseText);
                        }
                    } catch (e) {
                        error({ retcode: xhr.status });
                        console.error(e);
                    }
                } else {
                    error({ retcode: xhr.status });
                }
                xhr = null;
            }
        }
        xhr.send(method === 'GET' ? null : _encode(data));
        return xhr;
    },
    _jsonp = function jsonp(para) {
        var url = para.url,
            success = para.success || _noop,
            error = para.error || _noop,
            data = para.data, key;

        if (~url.indexOf('?')) {
            url += '&jsoncallback=define&callback=define';
        } else {
            url += '?jsoncallback=define&callback=define';
        }
        url += '&_t=' + new Date;

        if (data) {
            for (key in data) {
                url += ('&' + key + '=' + data[key]);
            }
        }

        require([url], function (res) {
            success(res);
            _clear(url);
        }, function (res) {
            error(res);
            _clear(url);
        });
    },
    _clear = function (url) {
        var key, require = window.require;
        for (key in require.cache) {
            if (~key.indexOf(url)) {
                delete require.cache[key];
                break;
            }
        }
    }

/**
 * DB
 * @class
 * @param {Object} options this is just a $.ajax setting
 *      @param {Array} options.errHandles
 *      @param {Array} options.succHandles
 *      @param {Function} options.succ
 *      @param {Function} options.err
 */
function DB(options) {
    this._init(options);
}
_extend(DB.prototype, {
    _init: function (options) {
        this.errHandles = options.errHandles || [];
        this.succHandles = options.succHandles || [];
        this.errHandles.unshift.apply(this.errHandles, DB.options.errHandles || []);
        this.succHandles.unshift.apply(this.succHandles, DB.options.succHandles || []);
        options = _extend({}, DB.options || {}, options);
        this.options = options;
    },
    _wrap: function (options) {
        var self = this;
        options.success = function (data) {
            // you may want to modify this line for judging error or success
            if ('retcode' in data) {
                data.retcode === 0 ?
                    self._apply(self.succHandles, data, options, options.succ) :
                    self._apply(self.errHandles, data, options, options.err);
            } else {
                self._apply(self.succHandles, data, options, options.succ);
            }
        };
        options.error = function (data) {
            self._apply(self.errHandles, data, options, options.err);
        };
        return options;
    },
    /**
     * _apply
     * @param {Array} handles 处理函数列队，每一个是一个管子
     * @param {*} data 要处理的数据
     * @param {Object} options 可选参数
     * @param {Function} cb 处理后回调
     */
    _apply: function (handles, data, options, cb) {
        var i = 0,
            l = handles.length,
            res = data;
        for (i; i < l; i++) {
            res = handles[i].call(this, res, options);
            // if handle return false, just break
            if (res === false) return;
        }
        cb && cb(res);
    },
    /**
     * ajax
     * @param {Object} options this is just a $.ajax setting
     *      @param {Function} options.succ
     *      @param {Function} options.err
     */
    ajax: function (options) {
        options = this._wrap(_extend({}, this.options, options));
        !options.data &&
            (options.data = options.param);
        if (
            options.beforeAjax &&
                options.beforeAjax.call(this, options)
        ) return;
        options.type === 'jsonp' ?
            _jsonp(options) : _ajax(options);
    }
});
_extend(DB, {
    httpMethod: function (options) {
        var db = new DB(options);
        return function (opt) {
            db.ajax(opt);
            return this;
        };
    },
    extend: _extend,
    // default options
    options: {}
});

module.exports = DB;
/* jshint ignore:end */
