/**
 * ## Clkchange Component
 * Input some value and emit a change event
 *
 * @component clkchange
 */
module.exports = {
    data: {},
    methods: {
        /**
         * show input and change a text node when it submit
         */
        setMessage: function () {
            this.$.input.$once('submit', function (value) {
                /**
                 * Change event
                 *
                 * @event Clkchange#setMessage
                 */
                value && this.$emit('change', value);
            });
            this.$.input.show();
        }
    }
};
