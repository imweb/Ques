var Q = require('Q');

function init(container) {
    Q.all({
        el: container,
        data: {}
    });
}

module.exports = {
    init: init
};
