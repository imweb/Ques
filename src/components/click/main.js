/**
 * ## Click Component
 *
 * Just a button can emit click event
 * @component click
 */
module.exports = {
    data: {},
    methods: {
        /**
         * emit click event
         */
        click: function () {
            /**
             * Click event.
             *
             * @event Click#click
             */
            this.$emit('click');
        }
    }
};


// just for test

/**
 * Click Me
 *
 * @content
 */
