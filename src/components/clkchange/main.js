module.exports = {
    data: {},
    methods: {
        setMessage: function () {
            this.$.input.$once('submit', function (value) {
                value && this.$emit('change', value);
            });
            this.$.input.show();
        }
    }
};
