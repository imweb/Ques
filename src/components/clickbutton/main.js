/**
 * ## Clickbutton Component
 * Click a button and show a dialog
 *
 * @component clickbutton
 */
module.exports = {
    data: {},
    methods: {
        /**
         * just show dialog
         */
        showDialog: function () {
            this.$.dialog.show();
        }
    }
};

// just for test

/**
 * Click Me
 *
 * @content
 */
