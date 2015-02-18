var Q = require('Q'),
    $ = require('jquery'),
    filters = require('filters');

function Render(el, opts, tpl, data, options) {
    var self = this;
    this.el = el;
    this.options = $.extend({}, { filters: filters }, { filters: opts.filters }, options);
    this.opts = opts
    this.data = data;
    this.tpl = tpl;
    this.render(data);
    this.timeout = setTimeout(function () {
        self.bind();
    }, 0);
}
var p = Render.prototype;
p.render = function (data, options) {
    this.data = data;
    $(this.el).html(this.tpl(data, options || this.options));
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
