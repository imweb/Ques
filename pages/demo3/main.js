var $ = require('jquery'),
    helloworld = require('components/helloworld/render'),
    theader = require('components/theader/render'),
    tfooter = require('components/tfooter/render'),
    tnav = require('components/tnav/render');

function init() {
    theader.appendTo('#container', { title: 'qiqi', text: 'Road to the future.' });
    helloworld.appendTo('#container');
}

module.exports = {
    init: init
};
