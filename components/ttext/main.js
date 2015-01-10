var Q = require('Q');

function init(container) {
    Q.all({
        el: container,
        data: {},
        filters: require('filters')
    });
}

module.exports = {
    init: init
};
