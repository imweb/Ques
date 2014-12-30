var Q = require('Q'), iclick, itext;

function _setElements() {
    iclick = Q('#iclick')[0];
    itext = Q('#itext')[0];
}

function init() {
    _setElements();
    iclick.on('change', function (e, value) {
        itext.set('text', 'You have change to ' + value);
    });
}

return {
    init: init
};
