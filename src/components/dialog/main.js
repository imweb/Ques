var _ = require('Q')._;


/**
 * ## Dialog Component
 *
 * Create a new component extend dialog
 * * html:
 * ```
 * <dialog extend>
 *      <p>I'm a dialog.</p>
 * </dialog>
 * ```
 * * js:
 * ```
 * module.exports = {
 *      data: {
 *          isShow: true
 *      }
 * };
 * ```
 * Set the property `show` is true, so the new component will show default.
 * @component dialog
 */
module.exports = {
    data: {
        /**
         * @property {Boolean} isShow - dialog show or not
         */
        isShow: false
    },
    methods: {
        /**
         * emit submit event
         */
        submit: function () {
            /**
             * Submit event.
             *
             * @event Dialog#submit
             */
            this.$emit('submit');
        },
        /**
         * emit cancel event & hide
         */
        cancel: function () {
            /**
             * Cancel event.
             *
             * @event Dialog#cancel
             */
            this.$emit('cancel')
                .hide();
        },
        /**
         * show the dialog
         */
        show: function () {
            this.$set('isShow', true);
        },
        /**
         * hide the dialog
         */
        hide: function () {
            this.$set('isShow', false);
        }
    },
    ready: function () {
        var dialog = _.find('.$__$', this.$el)[0];
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
};
