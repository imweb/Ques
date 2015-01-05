var STORAGE_KEY = 'todos-quesjs';

module.exports = {
    fetch: function () {
        var res = []
        try {
            res = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch(e) {
            return res;
        }
        return res;
    },
    save: function (todos) {
        window.JSON &&
            localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
    }
}
