/**
 * @maintainer donaldyang
 */
var DB = require('db.core');

DB.extend({
    /**
     * getFeeder
     * 饲养员异步数据模型，类似jQuery.Callback的模型
     * @param {Object} options
     */
    getFeeder: function (options) {
        var db = new DB(options || {}),
            res = function (opt) {
                db.prepare(opt);
                return this;
            };
        db._feedData = null;
        db._feeds = [];
        db.prepare = function (options) {
            options = this._wrap(DB.extend({}, this.options, options));
            !options.data &&
                (options.data = options.param);
            options.beforeAjax &&
                options.beforeAjax.call(this, options);
            this._feeds.push(options.success.bind(options));
            if (db._feedData) return this.feed(this._feedData);
        };
        /**
         * feed
         * 饲养方法，只需喂一次，每次都干活
         * @param {Object} data
         */
        res.feed = function (data) {
            // cache the data
            db._feedData || (db._feedData = data);
            db._feeds.forEach(function (cb) {
                cb(data);
            });
            db._feeds.length = 0;
        };
        return res;
    }
})


module.exports = DB;
