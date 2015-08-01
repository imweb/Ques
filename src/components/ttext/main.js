/**
 * ## Ttext Component
 *
 * just a text node
 * @component ttext
 */
module.exports = {
    /**
     * ```
     * {
     *      text: 'Hello'
     * }
     * ```
     *
     * @mock
     */
    data: {
        /**
         * @property {String} text - which message will show
         */
        text: undefined
    },
    filters: require('filters')
};
