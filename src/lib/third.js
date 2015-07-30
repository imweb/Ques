var Q = require('Q.core'),
    _ = Q._,
    pool = {};

function key(k, value) {
    if (value === undefined) {
        return pool[k];
    }
    pool[k] = value;
}

function data(el, inst) {
    el = typeof el === 'string' ? _.find(el)[0] : el;
    return _.data(el, 'third-inst', inst);
}

function Third(el, opts, q) {
    el = typeof el === 'string' ? _.find(el)[0] : el;
    this.el = el;
    // if q is undefined, just mock a ViewModel
    this.vm = q || new Q();
    // just extend options all methods
    _.extend(this, opts);
    // cache the instance
    data(el, this);
    this.bind();
}
_.extend(Third, {
    key: key,
    get: data,
});

module.exports = Third;
