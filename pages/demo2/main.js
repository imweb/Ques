var $ = require('jquery'),
    helloworld = require('components/helloworld/render'),
    theader = require('components/theader/render'),
    tfooter = require('components/tfooter/render'),
    tnav = require('components/tnav/render');

function init() {
    tnav.appendTo('#container');
    theader.appendTo('#container', { title: 'qiqi', text: 'Road to the future.' });
    helloworld.appendTo('#container');
    tfooter.appendTo('#container', { text: '异步绑定的自定义元素会导致页面闪动' });
}

module.exports = {
    init: init
};
