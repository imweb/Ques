var $ = require('jquery'),
    qtree = require('components/qtree/render');

function _bindEvent() {
    qtree.get('#anchor-list')
        .on('dblclick-item', function (e) {
            var $this = $(e.triggerTarget);
            alert('房间' + $this.data('roomid') + ', 主播' + $this.data('anchorid'));
        }).on('show', function () {
            // to fix the list height
            $('.qtree__list', '#anchor-list').css({ height: 56 });
        });
    qtree.get('#room-list')
        .on('dblclick-item', function (e) {
            var $this = $(e.triggerTarget);
            alert('房间' + $this.data('roomid'));
        }).on('show', function () {
            // to fix the list height
            $('.qtree__list', '#room-list').css({ height: 56 });
        });
}

function init() {
    var container = $('#container').empty();
    qtree.appendTo(container, {
        title: '我关注的主播',
        id: 'anchor-list',
        list: [
            {
                roomid: 123,
                name: '夲色灬ツ笑笑',
                avatar: 'http://gg.ewang.com/group1/M00/3F/EC/wKgDM1STIbeAMGXGAAAPKVAE_yo796.jpg',
                offline: true,
                anchorid: 321
            }
        ]
    }, null, false);
    qtree.appendTo(container, {
        title: '我收藏的房间',
        id: 'room-list',
        list: [
            {
                roomid: 123,
                name: '本色娱乐美女直播',
                avatar: 'http://pub.idqqimg.com/pc/misc/files/20140911/88b01d92b2014207a151eba0bb1d11f4.jpg',
                intro: '美女直播尽在本色娱乐'
            }
        ]
    }, null, false);

    _bindEvent();
}

module.exports = {
    init: init
};
