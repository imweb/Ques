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

        directives: {
            'todo-focus': function (value, options) {
                if (!value) {
                    return;
                }
                var el = options.node;
                setTimeout(function () {
                    el.focus();
                }, 0);
            }
        },

        ready: function () {
            var self = this;
            this.$watch('todos', function () {
                storage.save(self.data('todos').get());
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
                return todos.filter(this.data('filters').get()[this.data('activeFilter').get()]);
            },
            checkActive: function (value, type) {
                return value === type;
            },
            filterRemaining: _filterRemaining,
            isAllSelect: _isAllSelect
        },

        methods: {
            addTodo: function (e) {
                if (!e.target.value) return;
                var todos = this.data('todos').get();
                todos.push({ title: e.target.value, completed: false });
                this.data('todos').set(todos);
                e.target.value = '';
            },
            editTodo: function (obj) {
                this.data('todos', obj).set('editing', true);
            },
            removeTodo: function (obj) {
                var todos = this.data('todos').get(), i = todos.indexOf(obj);
                if (~i) {
                    todos.splice(i, 1);
                    this.data('todos').set(todos);
                }
            },
            doneEdit: function (obj) {
                this.data('todos', obj).set('editing', false);
            },
            toggleItem: function (obj) {
                this.data('todos', obj).set('completed', !obj.completed);
            },
            toggleAll: function (obj) {
                var todos = this.data('todos').get(),
                    completed = true;
                if (_isAllSelect(todos)) completed = false;
                todos.forEach(function (todo) {
                    todo.completed = completed;
                });
                this.data('todos').set(todos);
            },
            removeCompleted: function () {
                var todos = this.data('todos').get();
                todos.forEach(function (todo) {
                    todo.completed = false;
                });
                this.data('todos').set(todos);
            }
        }
    });
    hasInit = true;
}

module.exports = {
    init: init
};
