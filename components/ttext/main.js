var Q = require('Q');

function init(container) {
    var q = new Q({
        el: container,
        data: {}
    });
}

module.exports = {
    init: init
};
