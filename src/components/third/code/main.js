var _ = require('Q')._;

module.exports = {
    bind: function () {
        var el = this.el,
            script = document.createElement('script');
        script.onload = function () {
            hljs.highlightBlock(el);
            _.addClass(el, 'show');
        }
        script.src = '//cdnjs.cloudflare.com/ajax/libs/highlight.js/8.6/highlight.min.js';
        document.body.appendChild(script);
    },
    unbind: function () {}
};
