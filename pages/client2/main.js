var $ = require('jquery'),
    qtree = require('components/qtree/render');

var ANCHOR_DATA = {
    title: '我关注的主播',
    id: 'anchor-list',
    list: [
        {
            roomid: 123,
            name: '我在线啊',
            avatar: 'http://gg.ewang.com/group1/M00/3F/EC/wKgDM1STIbeAMGXGAAAPKVAE_yo796.jpg',
            offline: false,
            anchorid: 5464
        },
        {
            roomid: 123,
            name: '夲色灬ツ笑笑',
            avatar: 'http://gg.ewang.com/group1/M00/3F/EC/wKgDM1STIbeAMGXGAAAPKVAE_yo796.jpg',
            offline: true,
            anchorid: 321
        }
    ]
},  ROOM_DATA = {
    title: '我收藏的房间',
    id: 'room-list',
    needDel: true,
    list: [
        {
            roomid: 123,
            name: '本色娱乐美女直播1',
            avatar: 'http://pub.idqqimg.com/pc/misc/files/20140911/88b01d92b2014207a151eba0bb1d11f4.jpg',
            intro: '美女直播尽在本色娱乐'
        },
        {
            roomid: 124,
            name: '本色娱乐美女直播2',
            avatar: 'http://pub.idqqimg.com/pc/misc/files/20140911/88b01d92b2014207a151eba0bb1d11f4.jpg',
            intro: '美女直播尽在本色娱乐'
        },
        {
            roomid: 125,
            name: '本色娱乐美女直播3',
            avatar: 'http://pub.idqqimg.com/pc/misc/files/20140911/88b01d92b2014207a151eba0bb1d11f4.jpg',
            intro: '美女直播尽在本色娱乐'
        },{
            roomid: 126,
            name: '本色娱乐美女直播4',
            avatar: 'http://pub.idqqimg.com/pc/misc/files/20140911/88b01d92b2014207a151eba0bb1d11f4.jpg',
            intro: '美女直播尽在本色娱乐'
        }
    ]
};

function _bindEvent() {
    qtree.get('#anchor-list')
        .on('dblclick-item', function (e) {
            var $this = $(e.triggerTarget);
            alert('房间' + $this.data('roomid') + ', 主播' + $this.data('anchorid'));
        }).on('show', function () {
            // to fix the list height
            $('.qtree__list', '#anchor-list').css({ height: 56 * ANCHOR_DATA.list.length });
        });
    qtree.get('#room-list')
        .on('dblclick-item', function (e) {
            var $this = $(e.triggerTarget);
            alert('房间' + $this.data('roomid'));
        }).on('show', function () {
            // to fix the list height
            $('.qtree__list', '#room-list').css({ height: 56 * ROOM_DATA.list.length });
        }).on('click-del', function (e) {
            var $this = $(e.triggerTarget);
            alert('删除房间' + $this.data('roomid'));
        }).set({
            'itemHeight': 58
        });
}

function init() {
    var container = $('#container').empty();
    qtree.appendTo(container, ANCHOR_DATA, null, false);
    qtree.appendTo(container, ROOM_DATA, null, false);
    _bindEvent();
}

module.exports = {
    init: init
};
