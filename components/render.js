var $ = require('jquery'),
    css = require('./main.css'),
    tpl = require('./main.html'),
    main = require('./main');

function loadCss() {
    $('head').append([
        '<style>',
        css(),
        '</style>'
    ].join('\n'));
    loadCss = function () {};
}

main.appendTo = function (container, data, nocss) {
    !nocss && loadCss();
    var fragment = $(tpl(data))
    fragment.appendTo(container);
    main.init && main.init(fragment);
};
main.html = function (container, data, nocss) {
    !nocss && loadCss();
    container = $(container);
    container.html(tpl(data));
    main.init && main.init(container);
};
module.exports = main;
