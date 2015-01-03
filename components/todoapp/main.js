var Q = require('Q'),
    storage = require('./storage'),
    filters = require('filters'),
    hasInit = false;

function _calRemaining(todos) {
    return todos.filter(function (todo) {
        return !todo.computed;
    }).length;
}

function _calCompleted(todos) {
    return todos.length - _calRemaining(todos);
}

function init(container) {
    if (hasInit) return console.error('This is a single instance class');
    new Q({
        el: container,
        data: {
            // { title: String, completed: Boolean }
            todos: storage.fetch(),
            newTodo: '',
            editedTodo: null
        },

        ready: function () {
            var self = this;
            this.$watch('todos', function () {
                storage.save(self.data('todos'));
            }, true);
        },

        filters: {
            calRemaining: _calRemaining,
            calCompleted: _calCompleted,
            size: function (arr) {
                return arr.length;
            },
            key: filters.key,
            filterTodos: function (todos) {
                return todos.filter(function (todo) {
                    return !todo.completed;
                });
            }
        },

        methods: {
            addTodo: function (e) {
                var todos = this.data('todos');
                todos.push({ title: e.target.value, completed: false });
                this.data('todos', todos);
                e.target.value = '';
            },
            editTodo: function (obj) {
                var index;
                this.data('todos').forEach(function (todo, i) {
                    if (obj === todo) index = i;
                });
                // this.data('todos.' + index + '.title', 'hello');
            }
        }
    });
    hasInit = true;
}

module.exports = {
    init: init
};
