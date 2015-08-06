/**
 * ## List Runner Component
 *
 * List test runner
 * @component listrunner
 */
module.exports = {
    data: {
        time1: undefined,
        time2: undefined
    },
    methods: {
        run1: function () {
            var self = this,
                start = +new Date(),
                end;
            this.$emit('test1', function () {
                end = +new Date();
                self.$set('time1', end - start);
            });
        },
        run2: function () {
            var self = this,
                start = +new Date(),
                end;
            this.$emit('test2', function () {
                end = +new Date();
                self.$set('time2', end - start);
            });
        }
    },
    filters: {
        toWord: function (v, arg) {
            return arg + ': 耗时' + v + 'ms';
        }
    }
};
