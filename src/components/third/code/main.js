/* globals hljs: false */
var $ = require('jquery'),
    _ = require('Q')._;

function load() {
    var defer = $.Deferred(),
        script;
    if (window.hljs) {
        defer.resolve(hljs);
    } else {
        script = document.createElement('script');
        script.onload = function () {
            defer.resolve(hljs);
        };
        script.src = '//cdnjs.cloudflare.com/ajax/libs/highlight.js/8.6/highlight.min.js';
        document.body.appendChild(script);
    }
    return defer.promise();
}

module.exports = {
    bind: function () {
        var el = this.el;
        load().done(function (hljs) {
            hljs.highlightBlock(el);
            _.addClass(el, 'show');
        });
    },
    unbind: function () {}
};
