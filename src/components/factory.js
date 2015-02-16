var Q = require('Q');

// the instance factory
module.exports = function (el, opts) {
    opts.el = el;
    return Q.all(opts);
};
