var Q = require('Q'),
    storage = require('./storage'),
    filters = require('filters'),
    hasInit = false;

function _filterRemaining(todos) {
    return todos.filter(function (todo) {
        return !todo.completed;
    });
}

function _calRemaining(todos) {
    return _filterRemaining(todos).length;
}

function _calCompleted(todos) {
    return todos.length - _calRemaining(todos);
}

function _isAllSelect(todos) {
    return !_calRemaining(todos);
}

function init(container) {
    if (hasInit) return console.error('This is a single instance class');
    new Q({
        el: container,
        data: {
            // { title: String, completed: Boolean }
            todos: storage.fetch(),
            newTodo: '',
            editedTodo: null,
            activeFilter: 'all',
            filters: {
                all: function () {
                    return true;
                },
                active: function (todo) {
                    return !todo.completed;
                },
                completed: function (todo) {
                    return todo.completed;
                }
            }
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
            pluralize: filters.pluralize,
            filterTodos: function (todos) {
                return todos.filter(this.data('filters')[this.data('activeFilter')]);
            },
            checkActive: function (value, type) {
                return value === type;
            },
            filterRemaining: _filterRemaining,
            isAllSelect: _isAllSelect
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
                this.data('todos.' + index + '.editing', true);
            },
            removeTodo: function (obj) {
                var todos = this.data('todos');
                todos.forEach(function (todo, i) {
                    if (obj === todo) {
                        todos.splice(i, 1);
                    }
                });
                this.data('todos', todos);
            },
            doneEdit: function (obj) {
                var index;
                this.data('todos').forEach(function (todo, i) {
                    if (obj === todo) index = i;
                });
                this.data('todos.' + index + '.editing', false);
            },
            toggleItem: function (obj) {
                var index;
                this.data('todos').forEach(function (todo, i) {
                    if (obj === todo) index = i;
                });
                this.data('todos.' + index + '.completed', !obj.completed);
            },
            toggleAll: function (obj) {
                var todos = this.data('todos'),
                    completed = true;
                if (_isAllSelect(todos)) completed = false;
                todos.forEach(function (todo) {
                    todo.completed = completed;
                });
                this.data('todos', todos);
            }
        }
    });
    hasInit = true;
}

module.exports = {
    init: init
};
