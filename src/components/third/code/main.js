
module.exports = {
    bind: function () {
        var el = this.el,
            script = document.createElement('script');
        script.onload = function () {
            hljs.highlightBlock(el);
        }
        script.src = '//cdnjs.cloudflare.com/ajax/libs/highlight.js/8.6/highlight.min.js';
        document.body.appendChild(script);
    },
    unbind: function () {}
};
