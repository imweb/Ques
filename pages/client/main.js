var Q = require('Q');

function init() {
    var anchorList = Q.get('#anchor_list'),
        roomList = Q.get('#room_list');
    anchorList.list.push({
        roomid: 123,
        name: '夲色灬ツ笑笑',
        avatar: 'http://gg.ewang.com/group1/M00/3F/EC/wKgDM1STIbeAMGXGAAAPKVAE_yo796.jpg',
        offline: true,
        anchorid: 321
    });
    anchorList.$set('hide', false);

    roomList.list.push({
        roomid: 123,
        name: '本色娱乐美女直播',
        avatar: 'http://pub.idqqimg.com/pc/misc/files/20140911/88b01d92b2014207a151eba0bb1d11f4.jpg',
        intro: '美女直播尽在本色娱乐'
    });
    roomList.$set('hide', false);
}

return {
    init: init
};
