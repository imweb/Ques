var $ = require('jquery');

module.exports = {
    bind: function () {
        console.log(this);
        $(this.el).on('click', function () {
            alert('hello');
        })
    },
    unbind: function () {}
};
