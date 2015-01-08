var Q = require('Q');

function init(container) {
    Q.all({
        el: container,
        data: {
            num: null,
            hide: true,
            list: [],
            height: 56
        },
        directives: {
            src: function (value, options) {
                value &&
                    (options.node.src = value);
            },
            height: function (value, options) {
                options.node.style.height = (value || 0) + 'px';
            }
        },
        filters: {
            showIntro: function (offline) {
                return offline ? '[不在直播]' : '[在线]';
            },
            calHeight: function (list) {
                return this.height * list.length;
            }
        },
        methods: {
            toggle: function () {
                this.$set('hide', !this.hide);
            },
            enterRoom: function (obj) {
                obj.anchorid ?
                    alert('进入直播间id:' + obj.roomid + ', 主播id:' + obj.anchorid) :
                    alert('进入直播间id:' + obj.roomid);
            },
            del: function (obj) {
                obj.anchorid ?
                    alert('删除直播间id:' + obj.roomid + ', 主播id:' + obj.anchorid) :
                    alert('删除直播间id:' + obj.roomid);
                var i = this.list.indexOf(obj);
                this.list.splice(i, 1);
            }
        }
    });
}

module.exports = {
    init: init
};
