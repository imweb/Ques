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
    // if nostyle, just not append style to head
    this.options.nostyle ||
        this.style();
    this.render(data);
    this.timeout = setTimeout(function () {
        self.bind();
    }, 0);
}
var p = Render.prototype;
p.style = function () {
    this.tpl.css &&
        $('head').append([
            '<style>',
            this.tpl.css,
            '</style>'
        ].join(''));
    this.tpl.css = undefined;
};
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

module.exports = function (el, opts, tpl, data, options) {
    return new Render(el, opts, tpl, data, options);
};
