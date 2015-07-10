var $ = require('jquery');

module.exports = {
    bind: function () {
        var el = this.el;
        $.getScript('//cdnjs.cloudflare.com/ajax/libs/highlight.js/8.6/highlight.min.js', function () {
            hljs.highlightBlock(el);
        });
    },
    unbind: function () {}
};
