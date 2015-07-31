var Q = require('Q');

function bindEvent(q, control) {
    control.addEventListener('click', function (e) {
        var method = e.target.getAttribute('data-method');
        method && q[method]();
    });
}

function init() {
    var q = Q.get('.component-1'),
        methods = q.$options.methods || {},
        key,
        template = '',
        control = document.createElement('div');

    document.body.appendChild(control);

    template += '<h3>方法</h3>';

    for (key in methods) {
        if (typeof methods[key] === 'function') {
            template += '<button data-method="' + key + '" >' + key + '</button>';
        }
    }

    template += '<h3>事件</h3>';

    console.log(q);

    control.innerHTML = template;
    bindEvent(q, control);
}

module.exports = {
    init: init
};
