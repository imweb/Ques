var Q = require('Q');

function init(container) {
    var q = new Q({
        el: container,
        data: {}
    });
    q.setMessage = function (e) {
        var values = [
            'hello imweb!',
            'hello world!',
            'hello Tencent!',
            'hello donaldyang!',
            'hello qiqi!'
        ], value = values[Math.random() * 5 | 0];
        alert('现在值为:' + this.data.message + '; 要设置成:' + value)
        this.set('message', value);
    };
}

module.exports = {
    init: init
};
