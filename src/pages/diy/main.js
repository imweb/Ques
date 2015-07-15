var DB = require('./db.diy');

function init() {
    DB.ke({
        succ: function (data) {
            console.log(data)
        },
        err: function (data) {
            console.log(data)
        }
    })
}

return {
    init: init
};
