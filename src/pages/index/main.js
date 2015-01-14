var Q = require('Q');

function init() {
    var iclick = Q.get('#iclick'),
        itext = Q.get('#itext');
    iclick.$on('change', function (msg) {
        itext.data('text', msg);
    });
}

return {
    init: init
};
