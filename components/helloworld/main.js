var $ = require('jquery');

function init(container) {
    $(container).on('click', function () {
        alert('hello world!');
    });
}

module.exports = {
    init: init
};
