var filters = require('filters');

module.exports = {
    methods: {
        submit: function () {
            if (!this.curVal) {
                this.$set('focus', true);
            } else {
                this.$emit('submit', this.curVal);
                this.$set('curVal', '');
                this.hide();
            }
        },
        show: function () {
            // use super.show
            this.constructor.super.options.methods.show.call(this);
            this.$set('focus', true);
        }
    },
    directives: {
        focus: function (val) {
            val && this.el.focus();
        }
    },
    filters: {
        key: filters.key
    }
};
