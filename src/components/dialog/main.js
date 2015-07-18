var _ = require('Q')._;

module.exports = {
    data: {
        isShow: false
    },
    methods: {
        submit: function () {
            this.$emit('submit');
        },
        cancel: function () {
            this.$emit('cancel')
                .hide();
        },
        show: function () {
            this.$set('isShow', true);
        },
        hide: function () {
            this.$set('isShow', false);
        }
    },
    ready: function () {
        var dialog = _.find('.dialog', this.$el)[0];
        this.$watch('isShow', function (val) {
            if (val) {
                setTimeout(function () {
                    _.addClass(dialog, 'show');
                }, 20);
            } else {
                _.removeClass(dialog, 'show');
            }
        }, false, true);
    }
}
