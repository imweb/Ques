var DB = require('./db.diy'),
    Q = require('Q');

function init() {
    var recommend = Q.get('#recommend');

    DB.test({
        succ: function (data) {
            console.log(data);
            recommend.$set(data.result);
        },
        err: function () {
            // TODO
        }
    });
}

return {
    init: init
};
