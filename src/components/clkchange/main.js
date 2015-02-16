module.exports = {
    data: {},
    methods: {
        setMessage: function (e) {
            var value = prompt('要设置成:', '');
            if (value) {
                this.$emit('change', value);
            }
        }
    }
};
