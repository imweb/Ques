var Q = require('Q');

function init() {
    demo1();
    demo2();
}

function demo1() {
    var click1 = Q.get('#click1'),
        dialog1 = Q.get('#dialog1');

    click1.$on('click', function () {
        dialog1.show();
    });
}

function demo2() {
    var click2 = Q.get('#click2'),
        dialog2 = Q.get('#dialog2');

    click2.$on('click', function () {
        dialog2.show();
    });
}

return {
    init: init
};
