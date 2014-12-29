var Q = require('Q');

function init(container) {
    var q = new Q({
        el: container,
        data: {}
    });
    q.setMessage = function (e) {
        var value = prompt('现在值为:' + this.data.message + '; 要设置成:', '');
        if (value) {
            this.set('message', value);
        }
    };
}

module.exports = {
    init: init
};
