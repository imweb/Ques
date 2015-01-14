var Q = require('Q');

function init() {
    var anchorList = Q.get('#anchor_list'),
        roomList = Q.get('#room_list');
    anchorList.$set('list', [{
        roomid: 1,
        name: '夲色灬ツ笑笑1',
        avatar: 'http://gg.ewang.com/group1/M00/3F/EC/wKgDM1STIbeAMGXGAAAPKVAE_yo796.jpg',
        offline: true,
        anchorid: 1
    }, {
        roomid: 2,
        name: '夲色灬ツ笑笑2',
        avatar: 'http://gg.ewang.com/group1/M00/3F/EC/wKgDM1STIbeAMGXGAAAPKVAE_yo796.jpg',
        offline: false,
        anchorid: 2
    }, {
        roomid: 3,
        name: '夲色灬ツ笑笑3',
        avatar: 'http://gg.ewang.com/group1/M00/3F/EC/wKgDM1STIbeAMGXGAAAPKVAE_yo796.jpg',
        offline: false,
        anchorid: 3
    }]);
    anchorList.$set('hide', false);
    anchorList.$on('enter', function (obj) {
        alert('进入直播间id:' + obj.roomid + ', 主播id:' + obj.anchorid);
        // 这里做上报
        console.log(arguments);
    }).$on('delete', function (obj) {
        alert('删除直播间id:' + obj.roomid + ', 主播id:' + obj.anchorid);
        // 这里做上报
        console.log(arguments);
    });

    roomList.list.push({
        roomid: 4,
        name: '本色娱乐美女直播4',
        avatar: 'http://pub.idqqimg.com/pc/misc/files/20140911/88b01d92b2014207a151eba0bb1d11f4.jpg',
        intro: '美女直播尽在本色娱乐'
    });
    roomList.list.push({
        roomid: 5,
        name: '本色娱乐美女直播5',
        avatar: 'http://pub.idqqimg.com/pc/misc/files/20140911/88b01d92b2014207a151eba0bb1d11f4.jpg',
        intro: '美女直播尽在本色娱乐'
    });
    roomList.$set('hide', false);
    roomList.$on('enter', function (obj) {
        alert('进入直播间id:' + obj.roomid);
        // 这里做上报
        console.log(arguments);
    }).$on('delete', function (obj) {
        alert('删除直播间id:' + obj.roomid);
        // 这里做上报
        console.log(arguments);
    });
}

return {
    init: init
};
