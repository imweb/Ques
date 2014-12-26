var $ = require('jquery'),
    helloworld = require('components/helloworld/render'),
    theader = require('components/theader/render'),
    tfooter = require('components/tfooter/render');

function init() {
    theader.appendTo('#container', { text: '我是头啊' });
    theader.appendTo('#container', { text: '我也是头啊' });
    helloworld.appendTo('#container');
    tfooter.appendTo('#container', { text: '脚脚脚' });
}

module.exports = {
    init: init
};
