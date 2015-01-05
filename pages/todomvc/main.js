var Router = require('./director').Router,
    Q = require('Q');

function init() {
    var router = new Router(),
        q = Q.get('#todoapp');

    Object.keys(q.data('filters').get()).forEach(function (filter) {
        router.on(filter, function () {
            q.data('activeFilter').set(filter);
            q.data('todos').touch();
        });
    });

    router.configure({
        notfound: function () {
            window.location.hash = '';
            q.data('activeFilter').set('all');
        }
    });

    router.init();
}

module.exports = {
    init: init
};
