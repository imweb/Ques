var Q = require('Q');

function init(container) {
    var q = Q({
        el: container,
        data: {},
        methods: {
            setMessage: function (e) {
                var value = prompt('现在值为:' + this.data.message + '; 要设置成:', '');
                if (value) {
                    this.trigger('change', value);
                }
            }
        }
    });
}

module.exports = {
    init: init
};
