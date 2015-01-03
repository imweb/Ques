var STORAGE_KEY = 'todos-quesjs';

module.exports = {
    fetch: function () {
        try {
            var res = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch(e) {
            return res;
        }
        return res;
    },
    save: function (todos) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    }
}
