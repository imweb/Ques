var Q = require('Q'),
    $ = require('jquery'),
    tpl = require('./main.html'),
    opts = require('./main');

// the render factory
module.exports = function (el, data, filters) {
    $.extend((opts.filters = opts.filters || {}), filters);
    $(el).html(tpl(data, opts));
    opts.el = el;
    opts.data = data;
    var res = Q.all(opts);
    return res.length > 1 ? res : res[0];
};
