var Q = require('Q');

function init(container) {
    Q.all({
        el: container,
        data: {},
        methods: {
            enterLive: function () {
                alert('假设我们进入齐齐的直播大厅');
            }
        }
    });
}

module.exports = {
    init: init
};
