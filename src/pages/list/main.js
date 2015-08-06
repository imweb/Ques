var Q = require('Q'),
    Third = require('third');

function prepare() {
    var list = [];
    for (var i = 0, l = 500; i < l; i++) {
        list.push({
            msg: Math.random()
        });
    }
    return list;
}

function init() {
    var test1 = Q.get('#test1'),
        test2 = Third.get('#test2');

    Q.get('#runner')
        .$on('test1', function (done) {
            test1.$set('list', prepare());
            done();
        }).$on('test2', function (done) {
            test2.$set('list', prepare());
            done();
        });
}

return {
    init: init
};
