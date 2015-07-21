var marked = require('marked'),
    _ = require('Q')._;

marked.setOptions({
    gfm: true
})

module.exports = {
    bind: function () {
        var text = _.find('.markdown-body pre', this.el)[0].textContent,
            content = _.find('.markdown-body', this.el)[0];
        content.innerHTML = marked(text);
        _.addClass(this.el, 'show');
    },
    unbind: function () {}
};
