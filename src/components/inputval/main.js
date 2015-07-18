var filters = require('filters');

module.exports = {
    methods: {
        submit: function () {
            this.$emit('submit', this.curVal);
            this.$set('curVal', '');
            this.hide();
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
