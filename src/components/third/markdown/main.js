var marked = require('marked'),
    _ = require('Q')._;

marked.setOptions({
    gfm: true
})

module.exports = {
    bind: function () {
        var content = this.el.getElementsByClassName('markdown-body')[0];
        content.innerHTML = marked(content.textContent.replace(/\|\|/g, '\n'));
        _.addClass(this.el, 'show');
    },
    unbind: function () {}
};
