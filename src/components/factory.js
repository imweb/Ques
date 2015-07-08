var Q = require('Q');

// the instance factory
module.exports = function (el, opts) {
    // just a third party componet
    if (
        'bind' in opts &&
        'unbind' in opts &&
        !('data' in opts)
    ) {
        Q._.find(el).forEach(function (el) {
            opts.bind.call({
                // mock viewModel
                vm: new Q(),
                el: el
            })
        });
        return;
    } else {
        opts.el = el;
        return Q.all(opts);
    }
};
