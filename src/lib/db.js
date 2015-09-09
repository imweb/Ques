/**
 * @maintainer donaldyang
 */
var DB = require('db.core'),
    NAMESPACE = 'qqclient';

/**
 * refleshLoginStatus
 * 重试登录状态
 */
var refleshLoginStatus = (function () {
    var times = 0; //重试次数

    return {
        flesh: function () {
            // TODO login
        },
        reset: function () {
            times > 0 &&
                (times = 0);
        }
    };
})();

function _bindLocalFlag(foo) {
    return function (res) {
        foo.call(this, res, true);
    };
}

function handleError(data, options) {
    var self = this;
    // TODO
    switch (data.retcode) {
        case 100000:
            refleshLoginStatus.flesh(function () {
                self.ajax(options);
            });
            // stop call error callback
            return false;
    }
    return data;
}

function pullData(options) {
    var key = [NAMESPACE, options.url].join('@'),
        value = localStorage[key],
        self = this;
    // just for first time
    if (options.localOnce) {
        this.options.useLocal = false;
    }
    if (value) {
        setTimeout(function () {
            try {
                self._apply(
                    self.succHandles.slice(DB.options.succHandles.length),
                    JSON.parse(value),
                    options,
                    _bindLocalFlag(options.succ)
                );
            } catch(e) {}
        }, 0);

    }
}

function pushData(data, options, isRe) {
    var key = [NAMESPACE, options.url].join('@');
    try {
        localStorage[key] = JSON.stringify(data);
    } catch(e) {
        localStorage.clear();
        isRe ||
            pushData(data, options, true);
    }
}

function handleSucc(data, options) {
    refleshLoginStatus.reset();
    options.useLocal && pushData(data, options);
    return data;
}


function preload(options) {
    if (!('__PRELOAD__' in window)) {
        throw new Error('please use <diy-preload> first!');
    }
    var __PRELOAD__ = window.__PRELOAD__;
    if (__PRELOAD__[options.url]) {
        options.success(__PRELOAD__[options.url]);
    } else {
        __PRELOAD__[options.url] = options.success;
    }
}

function cgi(options) {
    if (!('__CGI__' in window)) {
        throw new Error('please use <diy-cgi> first!');
    }
    options.success({
        retcode: 0,
        result: window.__CGI__[options.cgi.split('=>')[0].trim()]
    });
}

// just set DB options
DB.options = {
    errHandles: [handleError],
    succHandles: [handleSucc],
    // cross origin
    xhrFields: {
        withCredentials: true
    },
    dataType: 'JSON',
    type: 'POST',
    // before Ajax
    beforeAjax: function (options) {
        if (options.preload) {
            preload.call(this, options);
            return true;
        } else if (options.cgi) {
            cgi.call(this, options);
            return true;
        } else if (options.useLocal) {
            pullData.call(this, options);
        }
    }
};

module.exports = DB;
