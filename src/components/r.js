var Q = require('Q'),
    $ = require('jquery');

function Render(el, opts, data, options) {
    var self = this;
    $.extend((opts.filters = opts.filters || {}), options.filters);
    this.el = el;
    this.opts = opts;
    this.data = data;
    this.render(data);
    this.timeout = setTimeout(function () {
        self.bind();
    }, 0);
}
var p = Render.prototype;
p.render = function (data, opts) {
    this.data = data;
    $(this.el).html(tpl(data, opts || this.opts));
    return this;
};
p.bind = function () {
    var opts = this.opts;
    opts.el = this.el;
    opts.data = this.data;
    Q.all(opts);
    return this;
};
p.unbind = function () {
    clearTimeout(this.timeout);
    return this;
};

module.exports = function (el, opts, data, options) {
    return new Render(el, opts, data, options);
};
