module.exports = {
    data: {},
    methods: {
        setMessage: function (e) {
            var self = this;
            this.$.input.$once('submit', function (value) {
                value && this.$emit('change', value);
            });
            this.$.input.show();
        }
    }
};
