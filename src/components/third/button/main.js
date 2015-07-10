var $ = require('jquery');

module.exports = {
    bind: function () {
        $(this.el).on('click', function () {
            alert('hello');
        })
    },
    unbind: function () {}
};
