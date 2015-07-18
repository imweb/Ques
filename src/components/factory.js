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
        var extend = opts.__extend__
            F = extend ?
                Q.require(extend) :
                Q;
        opts.el = el;
        return F.all(opts);
    }
};
