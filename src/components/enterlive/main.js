/**
 * ## Enterlive Component
 * Go to Qiqi Hall
 *
 * @component clkchange
 */
module.exports = {
    data: {},
    methods: {
        /**
         * just go to Qiqi hall
         */
        enterLive: function () {
            alert('假设我们进入齐齐的直播大厅');
            this.$emit('enter');
        }
    }
};
