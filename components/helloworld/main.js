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
            'hello qiqi!',
            'hello futrue',
            'hello QQ'
        ], value = values[Math.random() * 7 | 0];
        alert('现在值为:' + this.data.message + '; 要设置成:' + value)
        this.set('message', value);
    };
}

module.exports = {
    init: init
};
