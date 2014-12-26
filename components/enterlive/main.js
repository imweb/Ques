var $ = require('jquery');

function init(container) {
    $(container).on('click', function (e) {
        alert('假设我们进入了齐齐的直播大厅');
    });
}

module.exports = {
    init: init
};
