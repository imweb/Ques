var Router = require('./director').Router,
    Q = require('Q');

function init() {
    var router = new Router(),
        q = Q.get('#todoapp');

    ['all', 'active', 'completed'].forEach(function (filter) {
        router.on(filter, function () {
            q.$set('activeFilter', filter);
            q.todos.touch();
        });
    });

    router.configure({
        notfound: function () {
            window.location.hash = '';
            q.activeFilter.$set('all');
        }
    });

    router.init();
}

module.exports = {
    init: init
};
