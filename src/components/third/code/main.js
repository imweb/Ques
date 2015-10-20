/* globals hljs: false */
var _ = require('Q')._;

function load(cb) {
    var script;
    if (window.hljs) {
        cb(hljs);
    } else {
        script = document.createElement('script');
        script.onload = function () {
            cb(hljs);
        };
        script.src = '//cdnjs.cloudflare.com/ajax/libs/highlight.js/8.6/highlight.min.js';
        document.body.appendChild(script);
    }
}

module.exports = {
    bind: function () {
        var el = this.el;
        load(function (hljs) {
            hljs.highlightBlock(el);
            _.addClass(el, 'show');
        });
    },
    unbind: function () {}
};
