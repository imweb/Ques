var Q = require('Q');

function init() {
    demo1();
}

function demo1() {
    var click1 = Q.get('#click1'),
        dialog1 = Q.get('#dialog1');

    click1.$on('click', function () {
        dialog1.show();
    });
}

return {
    init: init
};
