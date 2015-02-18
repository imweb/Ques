var Render = require('../r'),
    tpl = require('./main.html'),
    opts = require('./main');

// the render factory
module.exports = function (el, data, options) {
    return Render(el, opts, tpl, data, options)
};
