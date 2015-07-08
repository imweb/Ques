var pool = {};

function set(key, value) {
    pool[key] = pool[key] || value;
}

function get(key) {
    return pool[key];
}

module.exports = {
    set: set,
    get: get
};
