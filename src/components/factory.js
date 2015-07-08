var Q = require('Q'),
    Third = require('third');

// the instance factory
module.exports = function (el, opts) {
    // just a third party componet
    if (
        'bind' in opts &&
        'unbind' in opts &&
        !('data' in opts)
    ) {
        Q._.find(el).forEach(function (el) {
            new Third(el, opts);
        });
        return;
    } else {
        opts.el = el;
        return Q.all(opts);
    }
};
