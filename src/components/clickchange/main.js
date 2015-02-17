var Q = require('Q'),
    clkchange = require('../clkchange/main'),
    ttext = require('../ttext/main');

Q.define('clkchange', clkchange);
Q.define('ttext', ttext);

module.exports = {
    data: {},
    // when vm init complied bind the data
    compiled: function () {
        var a = this.$.a,
            b = this.$.b;
        a.$on('change', function (value) {
            b.$set('text', value);
        });
    }
}
